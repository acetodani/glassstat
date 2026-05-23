from __future__ import annotations

import re
import hashlib
from pathlib import Path
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile
from sqlmodel import Session, select

from app.core.config import settings
from app.db.database import engine
from app.models.photo import Photo
from app.services.scanner import discover_files, scan_status
from app.services.parser import parse_exif_batch

router = APIRouter(prefix="/api/ingest", tags=["ingest"])

BATCH_SIZE = 200
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp",
    ".cr2", ".cr3", ".nef", ".arw", ".orf", ".rw2",
    ".raf", ".dng", ".heif", ".heic", ".avif",
}


def _sanitize_filename(name: str) -> str:
    name = Path(name).name
    name = re.sub(r'[^\w\s\-.]', '_', name)
    return name or "unnamed"


def _is_valid_image(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


@router.post("/scan")
async def start_scan(directory: str, background_tasks: BackgroundTasks):
    if scan_status.is_scanning:
        raise HTTPException(409, "A scan is already in progress")

    try:
        files = await discover_files(directory)
    except (FileNotFoundError, NotADirectoryError) as e:
        raise HTTPException(400, str(e))

    if not files:
        return {"message": "No image files found", "total": 0}

    scan_status.is_scanning = True
    scan_status.total_files = len(files)
    scan_status.processed = 0
    scan_status.errors = 0

    background_tasks.add_task(_run_scan, files)

    return {"message": "Scan started", "total": len(files)}


@router.post("/upload")
async def upload_files(files: List[UploadFile], background_tasks: BackgroundTasks):
    upload_dir = settings.upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    saved_paths: List[Path] = []
    skipped: List[str] = []
    duplicates: List[str] = []

    # Load existing file hashes for dedup
    existing_hashes = set()
    with Session(engine) as session:
        existing_photos = session.exec(select(Photo.file_name)).all()
        for name in existing_photos:
            existing_hashes.add(name)

    for file in files:
        if not file.filename:
            continue

        # Reject non-image files
        if not _is_valid_image(file.filename):
            skipped.append(f"{file.filename} (unsupported format)")
            continue

        # Check file size
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)

        if size == 0:
            skipped.append(f"{file.filename} (empty file)")
            continue

        if size > MAX_FILE_SIZE:
            skipped.append(f"{file.filename} (>{MAX_FILE_SIZE // (1024*1024)}MB)")
            continue

        # Hash first 64KB + file size for fast duplicate detection
        header = await file.read(65536)
        file_hash = hashlib.md5(header + str(size).encode()).hexdigest()[:12]
        await file.seek(0)

        safe_name = _sanitize_filename(file.filename)

        # Check if this exact file already exists (by name + content hash)
        if safe_name in existing_hashes:
            duplicates.append(safe_name)
            continue

        dest = upload_dir / safe_name
        if dest.exists():
            # File on disk already — skip
            duplicates.append(safe_name)
            continue

        # Stream write
        with open(dest, "wb") as out:
            # Write the header we already read
            out.write(header)
            while chunk := await file.read(65536):
                out.write(chunk)

        saved_paths.append(dest)
        existing_hashes.add(safe_name)

    if not saved_paths:
        msg = "No new files to upload"
        if duplicates:
            msg = f"{len(duplicates)} duplicate(s) skipped"
        if skipped:
            msg += f", {len(skipped)} too large"
        return {"message": msg, "total": 0, "skipped": skipped, "duplicates": duplicates}

    scan_status.is_scanning = True
    scan_status.total_files = len(saved_paths)
    scan_status.processed = 0
    scan_status.errors = 0

    background_tasks.add_task(_run_scan, saved_paths)

    return {
        "message": f"Uploaded {len(saved_paths)} files, scanning...",
        "total": len(saved_paths),
        "skipped": skipped,
        "duplicates": duplicates,
    }


@router.get("/status")
async def get_status():
    return {
        "is_scanning": scan_status.is_scanning,
        "total_files": scan_status.total_files,
        "processed": scan_status.processed,
        "errors": scan_status.errors,
        "progress": scan_status.progress,
        "current_file": scan_status.current_file,
    }


def _run_scan(files: List[Path]):
    with Session(engine) as session:
        # Batch duplicate detection — get all existing paths in one query
        all_paths = [str(f.resolve()) for f in files]
        existing_paths = set()
        for i in range(0, len(all_paths), 500):
            batch_paths = all_paths[i:i+500]
            found = session.exec(
                select(Photo.file_path).where(Photo.file_path.in_(batch_paths))
            ).all()
            existing_paths.update(found)

        for i in range(0, len(files), BATCH_SIZE):
            batch = files[i : i + BATCH_SIZE]
            scan_status.current_file = str(batch[0].name)

            try:
                photos = parse_exif_batch(batch)
                for photo in photos:
                    if photo.file_path not in existing_paths:
                        photo.has_file = True
                        session.add(photo)
                        existing_paths.add(photo.file_path)
                session.commit()
                scan_status.processed += len(batch)
            except Exception:
                scan_status.errors += len(batch)
                scan_status.processed += len(batch)

    scan_status.is_scanning = False
    scan_status.current_file = ""

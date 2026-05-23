from __future__ import annotations

import re
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


def _sanitize_filename(name: str) -> str:
    name = Path(name).name
    name = re.sub(r'[^\w\s\-.]', '_', name)
    return name or "unnamed"


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

    for file in files:
        if not file.filename:
            continue

        # Check file size
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)

        if size > MAX_FILE_SIZE:
            skipped.append(f"{file.filename} (>{MAX_FILE_SIZE // (1024*1024)}MB)")
            continue

        safe_name = _sanitize_filename(file.filename)
        dest = upload_dir / safe_name

        counter = 1
        while dest.exists():
            stem = Path(safe_name).stem
            suffix = Path(safe_name).suffix
            dest = upload_dir / f"{stem}_{counter}{suffix}"
            counter += 1

        # Stream write in chunks instead of loading entire file
        with open(dest, "wb") as out:
            while chunk := await file.read(8192):
                out.write(chunk)

        saved_paths.append(dest)

    if not saved_paths:
        msg = "No valid files uploaded"
        if skipped:
            msg += f". Skipped: {', '.join(skipped)}"
        return {"message": msg, "total": 0, "skipped": skipped}

    scan_status.is_scanning = True
    scan_status.total_files = len(saved_paths)
    scan_status.processed = 0
    scan_status.errors = 0

    background_tasks.add_task(_run_scan, saved_paths)

    return {
        "message": f"Uploaded {len(saved_paths)} files, scanning...",
        "total": len(saved_paths),
        "skipped": skipped,
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

from __future__ import annotations

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

BATCH_SIZE = 50


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
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    saved_paths = []

    for file in files:
        dest = settings.upload_dir / file.filename
        content = await file.read()
        dest.write_bytes(content)
        saved_paths.append(dest)

    if saved_paths:
        background_tasks.add_task(_run_scan, saved_paths)
        scan_status.is_scanning = True
        scan_status.total_files = len(saved_paths)
        scan_status.processed = 0
        scan_status.errors = 0

    return {"message": f"Uploaded {len(saved_paths)} files, scanning..."}


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
        for i in range(0, len(files), BATCH_SIZE):
            batch = files[i : i + BATCH_SIZE]
            scan_status.current_file = str(batch[0].name)

            try:
                photos = parse_exif_batch(batch)
                for photo in photos:
                    existing = session.exec(
                        select(Photo).where(Photo.file_path == photo.file_path)
                    ).first()
                    if not existing:
                        session.add(photo)
                session.commit()
                scan_status.processed += len(batch)
            except Exception:
                scan_status.errors += len(batch)
                scan_status.processed += len(batch)

    scan_status.is_scanning = False
    scan_status.current_file = ""

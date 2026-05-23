from __future__ import annotations

import mimetypes
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import Session, select, col
from pathlib import Path

from app.db.database import get_session
from app.models.photo import Photo

router = APIRouter(prefix="/api/photos", tags=["photos"])


@router.get("/")
def list_photos(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    lens: Optional[str] = None,
    session: Session = Depends(get_session),
):
    offset = (page - 1) * per_page
    query = select(Photo).order_by(col(Photo.date_taken).desc())

    if lens:
        query = query.where(Photo.lens_model == lens)

    photos = session.exec(query.offset(offset).limit(per_page)).all()

    total = session.exec(select(Photo)).all()

    return {
        "photos": [
            {
                "id": p.id,
                "file_name": p.file_name,
                "file_path": p.file_path,
                "file_format": p.file_format,
                "camera": p.camera_model,
                "lens": p.lens_model,
                "focal_length": p.focal_length,
                "aperture": p.aperture,
                "shutter_speed": p.shutter_speed,
                "iso": p.iso,
                "date_taken": str(p.date_taken) if p.date_taken else None,
                "gps_lat": p.gps_lat,
                "gps_lon": p.gps_lon,
                "width": p.image_width,
                "height": p.image_height,
                "has_file": Path(p.file_path).exists(),
            }
            for p in photos
        ],
        "page": page,
        "per_page": per_page,
        "total": len(total),
    }


@router.get("/{photo_id}")
def get_photo(photo_id: int, session: Session = Depends(get_session)):
    photo = session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")
    return {
        "id": photo.id,
        "file_name": photo.file_name,
        "file_path": photo.file_path,
        "file_format": photo.file_format,
        "camera_make": photo.camera_make,
        "camera_model": photo.camera_model,
        "lens_make": photo.lens_make,
        "lens_model": photo.lens_model,
        "focal_length": photo.focal_length,
        "focal_length_35mm": photo.focal_length_35mm,
        "aperture": photo.aperture,
        "shutter_speed": photo.shutter_speed,
        "iso": photo.iso,
        "date_taken": str(photo.date_taken) if photo.date_taken else None,
        "gps_lat": photo.gps_lat,
        "gps_lon": photo.gps_lon,
        "width": photo.image_width,
        "height": photo.image_height,
        "has_file": Path(photo.file_path).exists(),
    }


@router.get("/{photo_id}/file")
def get_photo_file(photo_id: int, session: Session = Depends(get_session)):
    photo = session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")

    path = Path(photo.file_path)
    if not path.exists():
        raise HTTPException(404, "File not found on disk")

    media_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return FileResponse(path, media_type=media_type)

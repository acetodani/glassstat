from __future__ import annotations

import mimetypes
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func, col
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

    # Use raw select for speed — avoid ORM overhead
    columns = [
        Photo.id, Photo.file_name, Photo.file_format, Photo.camera_model,
        Photo.lens_model, Photo.focal_length, Photo.aperture,
        Photo.shutter_speed, Photo.iso, Photo.date_taken,
        Photo.image_width, Photo.image_height, Photo.has_file,
    ]
    query = select(*columns).order_by(col(Photo.date_taken).desc())
    count_query = select(func.count(Photo.id))

    if lens:
        query = query.where(Photo.lens_model == lens)
        count_query = count_query.where(Photo.lens_model == lens)

    total = session.exec(count_query).one()
    rows = session.exec(query.offset(offset).limit(per_page)).all()

    return {
        "photos": [
            {
                "id": r[0],
                "file_name": r[1],
                "file_format": r[2],
                "camera": r[3],
                "lens": r[4],
                "focal_length": r[5],
                "aperture": r[6],
                "shutter_speed": r[7],
                "iso": r[8],
                "date_taken": str(r[9]) if r[9] else None,
                "width": r[10],
                "height": r[11],
                "has_file": r[12],
            }
            for r in rows
        ],
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.get("/{photo_id}")
def get_photo(photo_id: int, session: Session = Depends(get_session)):
    photo = session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")
    return {
        "id": photo.id,
        "file_name": photo.file_name,
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
        "has_file": photo.has_file,
    }


@router.get("/{photo_id}/file")
def get_photo_file(photo_id: int, session: Session = Depends(get_session)):
    photo = session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")

    path = Path(photo.file_path)
    if not path.exists():
        raise HTTPException(404, "File not found on disk")

    # For JPEG/PNG, serve orientation-corrected version
    suffix = path.suffix.lower()
    if suffix in (".jpg", ".jpeg", ".png"):
        corrected_dir = path.parent / ".corrected"
        corrected_path = corrected_dir / f"{path.stem}_corrected{suffix}"
        if corrected_path.exists():
            return FileResponse(
                corrected_path,
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=86400, immutable"},
            )
        try:
            from PIL import Image, ImageOps
            corrected_dir.mkdir(exist_ok=True)
            img = Image.open(path)
            img = ImageOps.exif_transpose(img)
            if img.mode != "RGB":
                img = img.convert("RGB")
            img.save(corrected_path, "JPEG", quality=92)
            return FileResponse(
                corrected_path,
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=86400, immutable"},
            )
        except Exception:
            pass

    media_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return FileResponse(
        path,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=86400, immutable"},
    )


@router.get("/{photo_id}/thumb")
def get_photo_thumb(photo_id: int, session: Session = Depends(get_session)):
    """Serve a thumbnail. Falls back to full file with aggressive caching."""
    photo = session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")

    path = Path(photo.file_path)
    if not path.exists():
        raise HTTPException(404, "File not found on disk")

    # Check for cached thumbnail
    thumb_dir = path.parent / ".thumbs"
    thumb_path = thumb_dir / f"{path.stem}_thumb.jpg"

    if thumb_path.exists():
        return FileResponse(
            thumb_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=604800, immutable"},
        )

    # Generate thumbnail if PIL available
    try:
        from PIL import Image, ImageOps
        thumb_dir.mkdir(exist_ok=True)
        img = Image.open(path)
        # Fix EXIF orientation (handles vertical photos)
        img = ImageOps.exif_transpose(img)
        img.thumbnail((400, 400), Image.LANCZOS)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(thumb_path, "JPEG", quality=80)
        return FileResponse(
            thumb_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=604800, immutable"},
        )
    except Exception:
        # Fallback: serve full file with cache headers
        media_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        return FileResponse(
            path,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )

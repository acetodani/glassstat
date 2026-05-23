from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col

from app.db.database import get_session
from app.models.photo import Photo
from app.services.wrapped import generate_wrapped
from app.services.archetypes import classify_archetype

router = APIRouter(prefix="/api/wrapped", tags=["wrapped"])


@router.get("/")
def get_wrapped(year: Optional[int] = None, session: Session = Depends(get_session)):
    return generate_wrapped(session, year)


@router.get("/archetype")
def get_archetype(session: Session = Depends(get_session)):
    return classify_archetype(session)


@router.get("/best-photo")
def get_best_photo(session: Session = Depends(get_session)):
    """Pick the 'best' photo — lowest ISO + sharpest aperture range + has file."""
    # Score: prefer low ISO, aperture between 4-8, has actual file
    photo = session.exec(
        select(Photo)
        .where(
            Photo.has_file == True,
            Photo.iso.isnot(None),
            Photo.aperture.isnot(None),
        )
        .order_by(
            Photo.iso.asc(),
            col(Photo.aperture).asc(),
        )
        .limit(1)
    ).first()

    if not photo:
        # Fallback: any photo with file
        photo = session.exec(
            select(Photo).where(Photo.has_file == True).limit(1)
        ).first()

    if not photo:
        return {"has_best": False}

    return {
        "has_best": True,
        "id": photo.id,
        "file_name": photo.file_name,
        "lens": photo.lens_model,
        "focal_length": photo.focal_length,
        "aperture": photo.aperture,
        "iso": photo.iso,
        "shutter_speed": photo.shutter_speed,
        "date_taken": str(photo.date_taken) if photo.date_taken else None,
        "camera": photo.camera_model,
    }

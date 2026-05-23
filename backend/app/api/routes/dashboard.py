from __future__ import annotations

from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, col

from app.db.database import get_session
from app.models.photo import Photo

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/")
def get_dashboard(session: Session = Depends(get_session)) -> Dict:
    # Single query for overview stats
    stats_row = session.exec(
        select(
            func.count(Photo.id),
            func.count(func.distinct(Photo.lens_model)),
            func.count(func.distinct(Photo.camera_model)),
            func.min(Photo.date_taken),
            func.max(Photo.date_taken),
        )
    ).one()

    total_photos = stats_row[0]
    unique_lenses = stats_row[1]
    unique_bodies = stats_row[2]
    earliest = stats_row[3]
    latest = stats_row[4]

    # Recent photos (last 8 by date)
    recent = session.exec(
        select(Photo)
        .order_by(col(Photo.date_taken).desc())
        .limit(8)
    ).all()

    recent_photos = [
        {
            "id": p.id,
            "file_name": p.file_name,
            "lens": p.lens_model,
            "focal_length": p.focal_length,
            "aperture": p.aperture,
            "iso": p.iso,
            "has_file": p.has_file,
        }
        for p in recent
    ]

    # Top gear (top 5 lenses by count)
    top_gear = session.exec(
        select(Photo.lens_model, func.count(Photo.id).label("cnt"))
        .where(Photo.lens_model.isnot(None))
        .group_by(Photo.lens_model)
        .order_by(func.count(Photo.id).desc())
        .limit(5)
    ).all()

    # Focal length distribution
    focal_length = session.exec(
        select(Photo.focal_length, func.count(Photo.id))
        .where(Photo.focal_length.isnot(None))
        .group_by(Photo.focal_length)
        .order_by(Photo.focal_length)
    ).all()

    # Activity sparkline (last 12 months)
    activity = session.exec(
        select(func.strftime("%Y-%m", Photo.date_taken), func.count(Photo.id))
        .where(Photo.date_taken.isnot(None))
        .group_by(func.strftime("%Y-%m", Photo.date_taken))
        .order_by(func.strftime("%Y-%m", Photo.date_taken).desc())
        .limit(12)
    ).all()

    return {
        "stats": {
            "total_photos": total_photos,
            "unique_lenses": unique_lenses,
            "unique_bodies": unique_bodies,
            "date_range": {
                "earliest": str(earliest) if earliest else None,
                "latest": str(latest) if latest else None,
            },
        },
        "recent_photos": recent_photos,
        "top_gear": [{"lens": lens, "count": count} for lens, count in top_gear],
        "focal_length": [{"focal_length": fl, "count": c} for fl, c in focal_length],
        "activity": [{"period": p, "count": c} for p, c in reversed(activity)],
    }

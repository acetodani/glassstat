"""Score photos to find the technically 'best' shot.

Scoring criteria (0-100 each, weighted):
- ISO score (30%): Lower is better. ISO 100 = 100pts, ISO 6400 = 20pts
- Aperture sweet spot (25%): f/4-f/8 = 100pts (sharpest range for most lenses)
- Shutter sharpness (20%): Faster shutter = sharper. 1/500+ = 100pts
- Golden hour (15%): Shot during 6-8am or 5-7pm = 100pts
- Resolution (10%): Higher megapixels = more detail
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional, Dict
from sqlmodel import Session, select

from app.models.photo import Photo


def score_photo(photo: Photo) -> float:
    total = 0.0

    # ISO score (30%) — lower is exponentially better
    if photo.iso:
        if photo.iso <= 100:
            iso_score = 100
        elif photo.iso <= 200:
            iso_score = 92
        elif photo.iso <= 400:
            iso_score = 80
        elif photo.iso <= 800:
            iso_score = 65
        elif photo.iso <= 1600:
            iso_score = 45
        elif photo.iso <= 3200:
            iso_score = 30
        else:
            iso_score = 15
        total += iso_score * 0.30

    # Aperture sweet spot (25%) — f/4-f/8 is sharpest for most lenses
    if photo.aperture:
        if 4.0 <= photo.aperture <= 8.0:
            ap_score = 100
        elif 2.8 <= photo.aperture < 4.0 or 8.0 < photo.aperture <= 11.0:
            ap_score = 75
        elif 1.4 <= photo.aperture < 2.8:
            ap_score = 55  # bokeh-y but less technically sharp
        elif photo.aperture > 11.0:
            ap_score = 50  # diffraction
        else:
            ap_score = 40
        total += ap_score * 0.25

    # Shutter sharpness (20%) — faster = less motion blur
    if photo.shutter_speed_sec:
        if photo.shutter_speed_sec <= 0.001:  # 1/1000+
            ss_score = 100
        elif photo.shutter_speed_sec <= 0.004:  # 1/250
            ss_score = 85
        elif photo.shutter_speed_sec <= 0.008:  # 1/125
            ss_score = 70
        elif photo.shutter_speed_sec <= 0.017:  # 1/60
            ss_score = 55
        elif photo.shutter_speed_sec <= 0.033:  # 1/30
            ss_score = 35
        else:
            ss_score = 20  # slow shutter, likely tripod or blur
        total += ss_score * 0.20

    # Golden hour (15%) — light quality
    if photo.date_taken:
        hour = photo.date_taken.hour
        if 6 <= hour <= 8 or 17 <= hour <= 19:
            total += 100 * 0.15
        elif 5 <= hour <= 9 or 16 <= hour <= 20:
            total += 60 * 0.15
        else:
            total += 30 * 0.15

    # Resolution (10%) — more pixels = more detail potential
    if photo.image_width and photo.image_height:
        megapixels = (photo.image_width * photo.image_height) / 1_000_000
        if megapixels >= 40:
            total += 100 * 0.10
        elif megapixels >= 24:
            total += 85 * 0.10
        elif megapixels >= 12:
            total += 60 * 0.10
        else:
            total += 35 * 0.10

    return total


def find_best_photo(session: Session) -> Optional[Dict]:
    """Find the highest-scored photo that has a file on disk."""
    photos = session.exec(
        select(Photo).where(Photo.has_file == True).limit(500)
    ).all()

    if not photos:
        return None

    scored = [(photo, score_photo(photo)) for photo in photos]
    scored.sort(key=lambda x: x[1], reverse=True)
    best = scored[0]

    return {
        "has_best": True,
        "id": best[0].id,
        "file_name": best[0].file_name,
        "lens": best[0].lens_model,
        "focal_length": best[0].focal_length,
        "aperture": best[0].aperture,
        "iso": best[0].iso,
        "shutter_speed": best[0].shutter_speed,
        "date_taken": str(best[0].date_taken) if best[0].date_taken else None,
        "camera": best[0].camera_model,
        "score": round(best[1], 1),
        "score_breakdown": {
            "technical_quality": "Scored on ISO, aperture sweet spot, shutter speed, lighting time, and resolution",
        },
    }

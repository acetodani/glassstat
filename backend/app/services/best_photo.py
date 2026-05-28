"""Score photos to find the technically 'best' shot.

Scoring criteria (0-100 each, weighted):
- ISO quality (25%): Lower = cleaner sensor
- Aperture sweet spot (20%): f/4-f/8 = peak sharpness for most lenses
- Shutter sharpness (15%): Faster = no motion blur
- Golden hour timing (15%): Best natural light
- Subject/composition (15%): Inferred from focal length + aperture combo
- Resolution (10%): Higher megapixels = more detail

Subject inference: We can't see the image pixels, but focal length + aperture
combinations strongly correlate with subject type and intentionality:
- 85-135mm + f/1.4-f/2.8 → Portrait (deliberate shallow DoF isolation)
- 14-35mm + f/8-f/16 → Landscape/Architecture (deliberate depth)
- 200mm+ + f/2.8-f/5.6 → Wildlife/Sports (tracking fast subjects)
- 35-50mm + f/1.4-f/2.8 → Street/Documentary (classic storytelling range)
- Any focal length + golden hour → Nature/Golden light (intentional timing)

Deliberate settings = photographer made active choices = likely better photo.
"""
from __future__ import annotations

from typing import Optional, Dict, List, Tuple
from sqlmodel import Session, select

from app.models.photo import Photo


def _detect_subject(photo: Photo) -> Tuple[str, float]:
    """Infer subject type and give a composition intent score (0-100)."""
    fl = photo.focal_length or 0
    ap = photo.aperture or 0
    iso = photo.iso or 0
    hour = photo.date_taken.hour if photo.date_taken else 12

    # Portrait: 85-135mm with wide aperture = deliberate isolation
    if 70 <= fl <= 135 and 1.0 <= ap <= 2.8:
        return ("portrait", 95)

    # Landscape/Architecture: wide + stopped down = deliberate depth
    if fl <= 35 and ap >= 8.0:
        return ("landscape", 90)

    # Wildlife/Sports: long tele + moderate aperture = tracking
    if fl >= 200 and ap <= 5.6:
        return ("wildlife", 88)

    # Street/Documentary: 35-50mm classic range, moderate aperture
    if 28 <= fl <= 55 and 1.4 <= ap <= 4.0:
        return ("street", 82)

    # Macro: very close focus implied by short FL + tight aperture
    if fl <= 100 and ap >= 11:
        return ("macro/detail", 78)

    # Golden hour + any deliberate settings
    if (6 <= hour <= 8 or 17 <= hour <= 19) and ap >= 4.0:
        return ("golden light", 85)

    # Night: high ISO + slow shutter = intentional night work
    if iso >= 3200 and (hour >= 20 or hour <= 5):
        return ("night", 70)

    # General/snapshot: less intentional settings combo
    if ap > 0 and fl > 0:
        return ("general", 50)

    return ("unknown", 30)


def score_photo(photo: Photo) -> Tuple[float, str]:
    """Score a photo 0-100, return (score, subject)."""
    total = 0.0

    # ISO quality (25%)
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
        total += iso_score * 0.25

    # Aperture sweet spot (20%)
    if photo.aperture:
        if 4.0 <= photo.aperture <= 8.0:
            ap_score = 100
        elif 2.8 <= photo.aperture < 4.0 or 8.0 < photo.aperture <= 11.0:
            ap_score = 75
        elif 1.4 <= photo.aperture < 2.8:
            ap_score = 60
        elif photo.aperture > 11.0:
            ap_score = 50
        else:
            ap_score = 40
        total += ap_score * 0.20

    # Shutter sharpness (15%)
    if photo.shutter_speed_sec:
        if photo.shutter_speed_sec <= 0.001:
            ss_score = 100
        elif photo.shutter_speed_sec <= 0.004:
            ss_score = 85
        elif photo.shutter_speed_sec <= 0.008:
            ss_score = 70
        elif photo.shutter_speed_sec <= 0.017:
            ss_score = 55
        elif photo.shutter_speed_sec <= 0.033:
            ss_score = 35
        else:
            ss_score = 20
        total += ss_score * 0.15

    # Golden hour (15%)
    if photo.date_taken:
        hour = photo.date_taken.hour
        if 6 <= hour <= 8 or 17 <= hour <= 19:
            total += 100 * 0.15
        elif 5 <= hour <= 9 or 16 <= hour <= 20:
            total += 60 * 0.15
        else:
            total += 30 * 0.15

    # Subject / composition intent (15%)
    subject, intent_score = _detect_subject(photo)
    total += intent_score * 0.15

    # Resolution (10%)
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

    return (total, subject)


def find_best_photo(session: Session) -> Optional[Dict]:
    """Find the highest-scored photo that has a file on disk."""
    photos = session.exec(
        select(Photo).where(Photo.has_file == True).limit(1000)
    ).all()

    if not photos:
        return None

    scored: List[Tuple[Photo, float, str]] = []
    for photo in photos:
        score, subject = score_photo(photo)
        scored.append((photo, score, subject))

    scored.sort(key=lambda x: x[1], reverse=True)
    best_photo, best_score, best_subject = scored[0]

    return {
        "has_best": True,
        "id": best_photo.id,
        "file_name": best_photo.file_name,
        "lens": best_photo.lens_model,
        "focal_length": best_photo.focal_length,
        "aperture": best_photo.aperture,
        "iso": best_photo.iso,
        "shutter_speed": best_photo.shutter_speed,
        "date_taken": str(best_photo.date_taken) if best_photo.date_taken else None,
        "camera": best_photo.camera_model,
        "score": round(best_score, 1),
        "subject": best_subject,
        "why": _explain_score(best_photo, best_score, best_subject),
    }


def _explain_score(photo: Photo, score: float, subject: str) -> str:
    """Human-readable explanation of why this photo scored highest."""
    reasons = []

    if photo.iso and photo.iso <= 200:
        reasons.append(f"clean ISO {photo.iso}")
    if photo.aperture and 4.0 <= photo.aperture <= 8.0:
        reasons.append(f"sharp f/{photo.aperture}")
    elif photo.aperture and photo.aperture <= 2.0:
        reasons.append(f"beautiful bokeh at f/{photo.aperture}")
    if photo.shutter_speed_sec and photo.shutter_speed_sec <= 0.002:
        reasons.append("tack sharp shutter speed")
    if photo.date_taken:
        hour = photo.date_taken.hour
        if 6 <= hour <= 8 or 17 <= hour <= 19:
            reasons.append("golden hour light")

    subject_labels = {
        "portrait": "Portrait composition",
        "landscape": "Landscape framing",
        "wildlife": "Wildlife/action capture",
        "street": "Street photography moment",
        "macro/detail": "Detailed close-up",
        "golden light": "Golden hour timing",
        "night": "Night photography",
    }
    if subject in subject_labels:
        reasons.insert(0, subject_labels[subject])

    return " · ".join(reasons) if reasons else f"Technical score: {score:.0f}/100"

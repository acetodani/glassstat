"""Classify photographers into fun archetypes based on shooting patterns."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict
from sqlmodel import Session, select, func, or_, and_

from app.models.photo import Photo


@dataclass
class Archetype:
    name: str
    emoji: str
    description: str
    confidence: float = 0.0


def classify_archetype(session: Session) -> Dict:
    total = session.exec(select(func.count(Photo.id))).one()
    if total == 0:
        return {"primary": None, "secondary": None, "all_scores": {}}

    scores: dict[str, float] = {}

    # Bokeh Addict: high percentage of shots at f/1.2-2.0
    wide_open = session.exec(
        select(func.count(Photo.id)).where(Photo.aperture.isnot(None), Photo.aperture <= 2.0)
    ).one()
    scores["bokeh_addict"] = wide_open / total

    # Pixel Peeper: low ISO (100-400) + stopped down (f/5.6-f/11)
    low_iso = session.exec(
        select(func.count(Photo.id)).where(Photo.iso.isnot(None), Photo.iso <= 400)
    ).one()
    sharp_ap = session.exec(
        select(func.count(Photo.id)).where(
            Photo.aperture.isnot(None), Photo.aperture >= 5.6, Photo.aperture <= 11
        )
    ).one()
    scores["pixel_peeper"] = (low_iso / total * 0.6) + (sharp_ap / total * 0.4)

    # Street Hunter: wide angles (24-35mm) + fast shutter (1/250s or faster)
    wide_angle = session.exec(
        select(func.count(Photo.id)).where(
            Photo.focal_length.isnot(None), Photo.focal_length >= 24, Photo.focal_length <= 35
        )
    ).one()
    fast_shutter = session.exec(
        select(func.count(Photo.id)).where(
            Photo.shutter_speed_sec.isnot(None), Photo.shutter_speed_sec <= 0.004
        )
    ).one()
    scores["street_hunter"] = (wide_angle / total * 0.5) + (fast_shutter / total * 0.5)

    # Golden Hour Chaser: shots between 5-7pm and 6-8am
    golden = session.exec(
        select(func.count(Photo.id)).where(
            Photo.date_taken.isnot(None),
            or_(
                and_(
                    func.cast(func.strftime("%H", Photo.date_taken), int) >= 17,
                    func.cast(func.strftime("%H", Photo.date_taken), int) <= 19,
                ),
                and_(
                    func.cast(func.strftime("%H", Photo.date_taken), int) >= 6,
                    func.cast(func.strftime("%H", Photo.date_taken), int) <= 8,
                ),
            ),
        )
    ).one()
    scores["golden_hour_chaser"] = golden / total

    # Telephoto Sniper: mostly 85mm+
    tele = session.exec(
        select(func.count(Photo.id)).where(Photo.focal_length.isnot(None), Photo.focal_length >= 85)
    ).one()
    scores["telephoto_sniper"] = tele / total

    # Night Owl: high ISO (1600+) and late hours (9pm-4am)
    high_iso = session.exec(
        select(func.count(Photo.id)).where(Photo.iso.isnot(None), Photo.iso >= 1600)
    ).one()
    night = session.exec(
        select(func.count(Photo.id)).where(
            Photo.date_taken.isnot(None),
            or_(
                func.cast(func.strftime("%H", Photo.date_taken), int) >= 21,
                func.cast(func.strftime("%H", Photo.date_taken), int) <= 4,
            ),
        )
    ).one()
    scores["night_owl"] = (high_iso / total * 0.5) + (night / total * 0.5)

    # All-Rounder: uses multiple focal length ranges evenly
    fl_wide = session.exec(
        select(func.count(Photo.id)).where(Photo.focal_length.isnot(None), Photo.focal_length < 35)
    ).one()
    fl_normal = session.exec(
        select(func.count(Photo.id)).where(
            Photo.focal_length.isnot(None), Photo.focal_length >= 35, Photo.focal_length < 70
        )
    ).one()
    fl_tele = session.exec(
        select(func.count(Photo.id)).where(
            Photo.focal_length.isnot(None), Photo.focal_length >= 70, Photo.focal_length < 135
        )
    ).one()
    fl_super = session.exec(
        select(func.count(Photo.id)).where(Photo.focal_length.isnot(None), Photo.focal_length >= 135)
    ).one()

    fl_values = [fl_wide, fl_normal, fl_tele, fl_super]
    non_zero = [v for v in fl_values if v > 0]
    if len(non_zero) >= 3:
        mean = sum(non_zero) / len(non_zero)
        variance = sum((v - mean) ** 2 for v in non_zero) / len(non_zero)
        evenness = 1 - min(1, (variance ** 0.5) / mean) if mean > 0 else 0
        scores["all_rounder"] = evenness * 0.7
    else:
        scores["all_rounder"] = 0.1

    # Sort and pick top results
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    archetypes_meta = {
        "bokeh_addict": ("The Bokeh Addict", "", "You live life wide open. Shallow depth of field is your love language."),
        "pixel_peeper": ("The Pixel Peeper", "", "Low ISO, sharp apertures, tripod life. You chase technical perfection."),
        "street_hunter": ("The Street Hunter", "", "Fast shutter speeds, wide angles, decisive moments. You're always ready."),
        "golden_hour_chaser": ("The Golden Hour Chaser", "", "You plan your life around the sun. Magic hour is your studio."),
        "telephoto_sniper": ("The Telephoto Sniper", "", "You reach for the long glass. Compression and isolation are your tools."),
        "night_owl": ("The Night Owl", "", "High ISO doesn't scare you. You find light where others see darkness."),
        "all_rounder": ("The All-Rounder", "", "Versatile and adaptive. No single focal length defines you."),
    }

    primary_key = sorted_scores[0][0]
    secondary_key = sorted_scores[1][0]

    p_name, p_emoji, p_desc = archetypes_meta[primary_key]
    s_name, s_emoji, s_desc = archetypes_meta[secondary_key]

    return {
        "primary": {
            "name": p_name,
            "emoji": p_emoji,
            "description": p_desc,
            "confidence": round(sorted_scores[0][1] * 100),
        },
        "secondary": {
            "name": s_name,
            "emoji": s_emoji,
            "description": s_desc,
            "confidence": round(sorted_scores[1][1] * 100),
        },
        "all_scores": {k: round(v * 100) for k, v in sorted_scores},
    }

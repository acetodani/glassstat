"""Classify photographers into fun archetypes based on shooting patterns."""

from dataclasses import dataclass
from sqlmodel import Session, select, func

from app.models.photo import Photo


@dataclass
class Archetype:
    name: str
    emoji: str
    description: str
    confidence: float  # 0-1


ARCHETYPES = {
    "bokeh_addict": Archetype(
        name="The Bokeh Addict",
        emoji="",
        description="You live life wide open. Shallow depth of field is your love language.",
        confidence=0,
    ),
    "pixel_peeper": Archetype(
        name="The Pixel Peeper",
        emoji="",
        description="Low ISO, sharp apertures, tripod life. You chase technical perfection.",
        confidence=0,
    ),
    "street_hunter": Archetype(
        name="The Street Hunter",
        emoji="",
        description="Fast shutter speeds, wide angles, decisive moments. You're always ready.",
        confidence=0,
    ),
    "golden_hour_chaser": Archetype(
        name="The Golden Hour Chaser",
        emoji="",
        description="You plan your life around the sun. Magic hour is your studio.",
        confidence=0,
    ),
    "telephoto_sniper": Archetype(
        name="The Telephoto Sniper",
        emoji="",
        description="You reach for the long glass. Compression and isolation are your tools.",
        confidence=0,
    ),
    "all_rounder": Archetype(
        name="The All-Rounder",
        emoji="",
        description="Versatile and adaptive. No single focal length defines you.",
        confidence=0,
    ),
    "night_owl": Archetype(
        name="The Night Owl",
        emoji="",
        description="High ISO doesn't scare you. You find light where others see darkness.",
        confidence=0,
    ),
    "burst_shooter": Archetype(
        name="The Burst Shooter",
        emoji="",
        description="More frames = more chances. You spray and pray with confidence.",
        confidence=0,
    ),
}


def classify_archetype(session: Session) -> dict:
    total = session.exec(select(func.count(Photo.id))).one()
    if total == 0:
        return {"primary": None, "secondary": None, "all_scores": {}}

    scores: dict[str, float] = {}

    # Bokeh Addict: high percentage of shots at f/1.2-2.0
    wide_open_count = session.exec(
        select(func.count(Photo.id)).where(Photo.aperture.isnot(None), Photo.aperture <= 2.0)
    ).one()
    scores["bokeh_addict"] = wide_open_count / total

    # Pixel Peeper: low ISO preference (mostly ISO 100-400) + stopped down (f/5.6-f/11)
    low_iso_count = session.exec(
        select(func.count(Photo.id)).where(Photo.iso.isnot(None), Photo.iso <= 400)
    ).one()
    sharp_aperture_count = session.exec(
        select(func.count(Photo.id)).where(
            Photo.aperture.isnot(None), Photo.aperture >= 5.6, Photo.aperture <= 11
        )
    ).one()
    scores["pixel_peeper"] = (low_iso_count / total * 0.6) + (sharp_aperture_count / total * 0.4)

    # Street Hunter: wide angles (24-35mm) + fast shutter (1/250+)
    wide_angle_count = session.exec(
        select(func.count(Photo.id)).where(
            Photo.focal_length.isnot(None), Photo.focal_length >= 24, Photo.focal_length <= 35
        )
    ).one()
    fast_shutter_count = session.exec(
        select(func.count(Photo.id)).where(
            Photo.shutter_speed_sec.isnot(None), Photo.shutter_speed_sec <= 0.004
        )
    ).one()
    scores["street_hunter"] = (wide_angle_count / total * 0.5) + (fast_shutter_count / total * 0.5)

    # Golden Hour Chaser: shots between 5-7pm and 6-8am
    golden_count = session.exec(
        select(func.count(Photo.id)).where(
            Photo.date_taken.isnot(None),
            func.cast(func.strftime("%H", Photo.date_taken), int).in_([6, 7, 17, 18, 19]),
        )
    ).one()
    scores["golden_hour_chaser"] = golden_count / total

    # Telephoto Sniper: mostly 85mm+
    tele_count = session.exec(
        select(func.count(Photo.id)).where(Photo.focal_length.isnot(None), Photo.focal_length >= 85)
    ).one()
    scores["telephoto_sniper"] = tele_count / total

    # Night Owl: high ISO (1600+) and late hours (9pm-4am)
    high_iso_count = session.exec(
        select(func.count(Photo.id)).where(Photo.iso.isnot(None), Photo.iso >= 1600)
    ).one()
    night_count = session.exec(
        select(func.count(Photo.id)).where(
            Photo.date_taken.isnot(None),
            func.cast(func.strftime("%H", Photo.date_taken), int).in_([21, 22, 23, 0, 1, 2, 3, 4]),
        )
    ).one()
    scores["night_owl"] = (high_iso_count / total * 0.5) + (night_count / total * 0.5)

    # All-Rounder: even distribution across focal lengths (low std dev)
    fl_counts = session.exec(
        select(
            func.count(Photo.id),
        )
        .where(Photo.focal_length.isnot(None))
        .group_by(
            func.case(
                (Photo.focal_length < 35, "wide"),
                (Photo.focal_length < 70, "normal"),
                (Photo.focal_length < 135, "tele"),
                else_="super_tele",
            )
        )
    ).all()
    if len(fl_counts) >= 3:
        values = [c for (c,) in fl_counts] if fl_counts else [0]
        mean = sum(values) / len(values) if values else 1
        variance = sum((v - mean) ** 2 for v in values) / len(values) if values else 0
        evenness = 1 - min(1, (variance ** 0.5) / mean) if mean > 0 else 0
        scores["all_rounder"] = evenness * 0.7
    else:
        scores["all_rounder"] = 0

    # Sort and pick top 2
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    primary_key = sorted_scores[0][0]
    secondary_key = sorted_scores[1][0] if len(sorted_scores) > 1 else None

    primary = ARCHETYPES[primary_key]
    primary.confidence = sorted_scores[0][1]

    secondary = None
    if secondary_key:
        secondary = ARCHETYPES[secondary_key]
        secondary.confidence = sorted_scores[1][1]

    return {
        "primary": {
            "name": primary.name,
            "emoji": primary.emoji,
            "description": primary.description,
            "confidence": round(primary.confidence * 100),
        },
        "secondary": {
            "name": secondary.name,
            "emoji": secondary.emoji,
            "description": secondary.description,
            "confidence": round(secondary.confidence * 100),
        } if secondary else None,
        "all_scores": {k: round(v * 100) for k, v in sorted_scores},
    }

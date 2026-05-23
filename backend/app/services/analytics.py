from __future__ import annotations

from typing import Optional, List, Dict
from sqlmodel import Session, select, func

from app.models.photo import Photo


def get_overview(session: Session) -> Dict:
    total = session.exec(select(func.count(Photo.id))).one()
    date_range = session.exec(
        select(func.min(Photo.date_taken), func.max(Photo.date_taken))
    ).one()
    unique_lenses = session.exec(
        select(func.count(func.distinct(Photo.lens_model))).where(Photo.lens_model.isnot(None))
    ).one()
    unique_bodies = session.exec(
        select(func.count(func.distinct(Photo.camera_model))).where(Photo.camera_model.isnot(None))
    ).one()

    return {
        "total_photos": total,
        "date_range": {"earliest": str(date_range[0]) if date_range[0] else None, "latest": str(date_range[1]) if date_range[1] else None},
        "unique_lenses": unique_lenses,
        "unique_bodies": unique_bodies,
    }


def get_focal_length_distribution(session: Session) -> List[Dict]:
    results = session.exec(
        select(Photo.focal_length, func.count(Photo.id))
        .where(Photo.focal_length.isnot(None))
        .group_by(Photo.focal_length)
        .order_by(Photo.focal_length)
    ).all()
    return [{"focal_length": fl, "count": count} for fl, count in results]


def get_aperture_distribution(session: Session, lens: Optional[str] = None) -> List[Dict]:
    query = (
        select(Photo.aperture, func.count(Photo.id))
        .where(Photo.aperture.isnot(None))
    )
    if lens:
        query = query.where(Photo.lens_model == lens)
    query = query.group_by(Photo.aperture).order_by(Photo.aperture)
    results = session.exec(query).all()
    return [{"aperture": ap, "count": count} for ap, count in results]


def get_iso_distribution(session: Session) -> List[Dict]:
    results = session.exec(
        select(Photo.iso, func.count(Photo.id))
        .where(Photo.iso.isnot(None))
        .group_by(Photo.iso)
        .order_by(Photo.iso)
    ).all()
    return [{"iso": iso, "count": count} for iso, count in results]


def get_shutter_speed_distribution(session: Session) -> List[Dict]:
    results = session.exec(
        select(Photo.shutter_speed, Photo.shutter_speed_sec, func.count(Photo.id))
        .where(Photo.shutter_speed.isnot(None))
        .group_by(Photo.shutter_speed, Photo.shutter_speed_sec)
        .order_by(Photo.shutter_speed_sec)
    ).all()
    return [{"shutter_speed": ss, "seconds": sec, "count": count} for ss, sec, count in results]


def get_timeline(session: Session, granularity: str = "monthly") -> List[Dict]:
    if granularity == "daily":
        date_expr = func.date(Photo.date_taken)
    elif granularity == "weekly":
        date_expr = func.strftime("%Y-W%W", Photo.date_taken)
    else:
        date_expr = func.strftime("%Y-%m", Photo.date_taken)

    results = session.exec(
        select(date_expr, func.count(Photo.id))
        .where(Photo.date_taken.isnot(None))
        .group_by(date_expr)
        .order_by(date_expr)
    ).all()
    return [{"period": period, "count": count} for period, count in results]


def get_time_of_day(session: Session) -> List[Dict]:
    results = session.exec(
        select(
            func.cast(func.strftime("%w", Photo.date_taken), int).label("day_of_week"),
            func.cast(func.strftime("%H", Photo.date_taken), int).label("hour"),
            func.count(Photo.id),
        )
        .where(Photo.date_taken.isnot(None))
        .group_by("day_of_week", "hour")
    ).all()
    return [{"day": dow, "hour": hour, "count": count} for dow, hour, count in results]


def get_gear_usage(session: Session) -> List[Dict]:
    lenses = session.exec(
        select(
            Photo.lens_model,
            Photo.lens_make,
            func.count(Photo.id),
            func.min(Photo.date_taken),
            func.max(Photo.date_taken),
        )
        .where(Photo.lens_model.isnot(None))
        .group_by(Photo.lens_model, Photo.lens_make)
        .order_by(func.count(Photo.id).desc())
    ).all()

    bodies = session.exec(
        select(
            Photo.camera_model,
            Photo.camera_make,
            func.count(Photo.id),
            func.min(Photo.date_taken),
            func.max(Photo.date_taken),
        )
        .where(Photo.camera_model.isnot(None))
        .group_by(Photo.camera_model, Photo.camera_make)
        .order_by(func.count(Photo.id).desc())
    ).all()

    gear = []
    for model, make, count, first, last in lenses:
        gear.append({"type": "lens", "make": make, "model": model, "count": count, "first_used": str(first) if first else None, "last_used": str(last) if last else None})
    for model, make, count, first, last in bodies:
        gear.append({"type": "body", "make": make, "model": model, "count": count, "first_used": str(first) if first else None, "last_used": str(last) if last else None})

    return gear


def get_map_data(session: Session) -> List[Dict]:
    results = session.exec(
        select(Photo.gps_lat, Photo.gps_lon, Photo.lens_model, Photo.date_taken)
        .where(Photo.gps_lat.isnot(None), Photo.gps_lon.isnot(None))
        .limit(10000)
    ).all()
    return [{"lat": lat, "lon": lon, "lens": lens, "date": str(dt) if dt else None} for lat, lon, lens, dt in results]

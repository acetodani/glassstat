"""Generate a 'Year in Photos' wrapped summary."""
from __future__ import annotations

from datetime import datetime
from typing import Optional, Dict, List
from sqlmodel import Session, select, func

from app.models.photo import Photo


def generate_wrapped(session: Session, year: Optional[int] = None) -> Dict:
    if year is None:
        year = datetime.now().year

    start = datetime(year, 1, 1)
    end = datetime(year, 12, 31, 23, 59, 59)

    total_photos = session.exec(
        select(func.count(Photo.id)).where(Photo.date_taken >= start, Photo.date_taken <= end)
    ).one()

    if total_photos == 0:
        return {"year": year, "total_photos": 0, "has_data": False}

    top_lens_result = session.exec(
        select(Photo.lens_model, func.count(Photo.id).label("cnt"))
        .where(Photo.date_taken >= start, Photo.date_taken <= end, Photo.lens_model.isnot(None))
        .group_by(Photo.lens_model)
        .order_by(func.count(Photo.id).desc())
        .limit(1)
    ).first()
    top_lens = top_lens_result[0] if top_lens_result else "Unknown"
    top_lens_pct = round((top_lens_result[1] / total_photos) * 100) if top_lens_result else 0

    top_fl_result = session.exec(
        select(Photo.focal_length, func.count(Photo.id))
        .where(Photo.date_taken >= start, Photo.date_taken <= end, Photo.focal_length.isnot(None))
        .group_by(Photo.focal_length)
        .order_by(func.count(Photo.id).desc())
        .limit(1)
    ).first()
    top_focal_length = top_fl_result[0] if top_fl_result else None

    top_body_result = session.exec(
        select(Photo.camera_model, func.count(Photo.id))
        .where(Photo.date_taken >= start, Photo.date_taken <= end, Photo.camera_model.isnot(None))
        .group_by(Photo.camera_model)
        .order_by(func.count(Photo.id).desc())
        .limit(1)
    ).first()
    top_body = top_body_result[0] if top_body_result else "Unknown"

    busiest_month_result = session.exec(
        select(func.strftime("%m", Photo.date_taken), func.count(Photo.id))
        .where(Photo.date_taken >= start, Photo.date_taken <= end)
        .group_by(func.strftime("%m", Photo.date_taken))
        .order_by(func.count(Photo.id).desc())
        .limit(1)
    ).first()
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    busiest_month = month_names[int(busiest_month_result[0]) - 1] if busiest_month_result else "N/A"
    busiest_month_count = busiest_month_result[1] if busiest_month_result else 0

    golden_hour_count = session.exec(
        select(func.count(Photo.id)).where(
            Photo.date_taken >= start,
            Photo.date_taken <= end,
            func.cast(func.strftime("%H", Photo.date_taken), int) >= 17,
            func.cast(func.strftime("%H", Photo.date_taken), int) <= 19,
        )
    ).one()
    golden_hour_pct = round((golden_hour_count / total_photos) * 100)

    avg_iso = session.exec(
        select(func.avg(Photo.iso)).where(
            Photo.date_taken >= start, Photo.date_taken <= end, Photo.iso.isnot(None)
        )
    ).one()

    # Count unique locations by counting distinct rounded lat/lon pairs
    gps_photos = session.exec(
        select(Photo.gps_lat, Photo.gps_lon).where(
            Photo.date_taken >= start, Photo.date_taken <= end,
            Photo.gps_lat.isnot(None), Photo.gps_lon.isnot(None),
        )
    ).all()
    unique_locations = len(set(
        (round(lat, 1), round(lon, 1)) for lat, lon in gps_photos
    ))

    # Longest streak
    days_shot = session.exec(
        select(func.distinct(func.date(Photo.date_taken)))
        .where(Photo.date_taken >= start, Photo.date_taken <= end)
        .order_by(func.date(Photo.date_taken))
    ).all()
    longest_streak = _calculate_streak(days_shot)

    return {
        "year": year,
        "has_data": True,
        "total_photos": total_photos,
        "top_lens": top_lens,
        "top_lens_percentage": top_lens_pct,
        "top_focal_length": top_focal_length,
        "top_body": top_body,
        "busiest_month": busiest_month,
        "busiest_month_count": busiest_month_count,
        "golden_hour_percentage": golden_hour_pct,
        "average_iso": round(avg_iso) if avg_iso else None,
        "unique_locations": unique_locations,
        "longest_streak_days": longest_streak,
    }


def _calculate_streak(dates: list) -> int:
    if not dates:
        return 0

    from datetime import timedelta, date as date_type

    parsed = []
    for d in dates:
        if isinstance(d, str):
            parsed.append(datetime.strptime(d, "%Y-%m-%d").date())
        elif isinstance(d, date_type):
            parsed.append(d)
        else:
            continue

    parsed = sorted(set(parsed))
    if not parsed:
        return 0

    max_streak = 1
    current_streak = 1

    for i in range(1, len(parsed)):
        if (parsed[i] - parsed[i - 1]).days == 1:
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 1

    return max_streak

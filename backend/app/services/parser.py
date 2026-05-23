from datetime import datetime
from pathlib import Path

from app.core.exiftool import extract_metadata
from app.models.photo import Photo


def parse_exif_batch(file_paths: list[Path]) -> list[Photo]:
    raw_data = extract_metadata(file_paths)
    photos = []

    for item in raw_data:
        photo = _normalize_exif(item)
        if photo:
            photos.append(photo)

    return photos


def _normalize_exif(data: dict) -> Photo | None:
    source_file = data.get("SourceFile")
    if not source_file:
        return None

    path = Path(source_file)
    date_taken = _parse_date(data.get("DateTimeOriginal"))
    shutter = data.get("ExposureTime")

    return Photo(
        file_path=str(path.resolve()),
        file_name=path.name,
        file_format=data.get("FileType", path.suffix.lstrip(".").upper()),
        camera_make=_clean_string(data.get("Make")),
        camera_model=_clean_string(data.get("Model")),
        lens_make=_clean_string(data.get("LensMake")),
        lens_model=_clean_string(data.get("LensModel")),
        focal_length=_to_float(data.get("FocalLength")),
        focal_length_35mm=_to_float(data.get("FocalLengthIn35mmFormat")),
        aperture=_to_float(data.get("FNumber")),
        shutter_speed=_format_shutter(shutter),
        shutter_speed_sec=_to_float(shutter),
        iso=_to_int(data.get("ISO")),
        date_taken=date_taken,
        gps_lat=_to_float(data.get("GPSLatitude")),
        gps_lon=_to_float(data.get("GPSLongitude")),
        image_width=_to_int(data.get("ImageWidth")),
        image_height=_to_int(data.get("ImageHeight")),
    )


def _parse_date(value) -> datetime | None:
    if not value or not isinstance(value, str):
        return None
    for fmt in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def _format_shutter(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, (int, float)) and value > 0:
        if value < 1:
            denom = round(1 / value)
            return f"1/{denom}"
        return f"{value}s"
    return str(value)


def _clean_string(value) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    return s if s else None


def _to_float(value) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _to_int(value) -> int | None:
    if value is None:
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None

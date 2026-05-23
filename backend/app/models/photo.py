from datetime import datetime
from sqlmodel import SQLModel, Field


class Photo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    file_path: str = Field(index=True, unique=True)
    file_name: str
    file_format: str
    camera_make: str | None = None
    camera_model: str | None = None
    lens_make: str | None = None
    lens_model: str | None = None
    focal_length: float | None = None
    focal_length_35mm: float | None = None
    aperture: float | None = None
    shutter_speed: str | None = None
    shutter_speed_sec: float | None = None
    iso: int | None = None
    date_taken: datetime | None = None
    gps_lat: float | None = None
    gps_lon: float | None = None
    image_width: int | None = None
    image_height: int | None = None
    scanned_at: datetime = Field(default_factory=datetime.utcnow)

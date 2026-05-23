from __future__ import annotations

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Photo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    file_path: str = Field(index=True, unique=True)
    file_name: str
    file_format: str
    has_file: bool = Field(default=True)
    camera_make: Optional[str] = None
    camera_model: Optional[str] = Field(default=None, index=True)
    lens_make: Optional[str] = None
    lens_model: Optional[str] = Field(default=None, index=True)
    focal_length: Optional[float] = Field(default=None, index=True)
    focal_length_35mm: Optional[float] = None
    aperture: Optional[float] = Field(default=None, index=True)
    shutter_speed: Optional[str] = None
    shutter_speed_sec: Optional[float] = None
    iso: Optional[int] = Field(default=None, index=True)
    date_taken: Optional[datetime] = Field(default=None, index=True)
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    scanned_at: datetime = Field(default_factory=datetime.utcnow)

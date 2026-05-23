"""Generate realistic demo data for GlassStat without requiring actual photos."""

import random
from datetime import datetime, timedelta
from sqlmodel import Session

from app.db.database import engine
from app.models.photo import Photo

LENSES = [
    ("Sony", "FE 35mm f/1.4 GM", 35.0, 35.0),
    ("Sony", "FE 24-70mm f/2.8 GM II", None, None),
    ("Sony", "FE 70-200mm f/2.8 GM II", None, None),
    ("Sony", "FE 85mm f/1.4 GM", 85.0, 85.0),
    ("Sony", "FE 16-35mm f/2.8 GM", None, None),
    ("Sony", "FE 50mm f/1.2 GM", 50.0, 50.0),
    ("Sigma", "35mm f/1.4 DG DN Art", 35.0, 35.0),
]

BODIES = [
    ("Sony", "ILCE-7M4"),
    ("Sony", "ILCE-7RM5"),
    ("Sony", "ILCE-9M3"),
]

APERTURES = [1.2, 1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11.0, 16.0]
ISOS = [100, 200, 400, 800, 1600, 3200, 6400]
SHUTTERS = [
    ("1/8000", 0.000125),
    ("1/4000", 0.00025),
    ("1/2000", 0.0005),
    ("1/1000", 0.001),
    ("1/500", 0.002),
    ("1/250", 0.004),
    ("1/125", 0.008),
    ("1/60", 0.0167),
    ("1/30", 0.033),
    ("1/15", 0.067),
]

LOCATIONS = [
    (35.6762, 139.6503),   # Tokyo
    (40.7128, -74.0060),   # New York
    (48.8566, 2.3522),     # Paris
    (51.5074, -0.1278),    # London
    (34.0522, -118.2437),  # Los Angeles
    (37.7749, -122.4194),  # San Francisco
    (25.2048, 55.2708),    # Dubai
    (1.3521, 103.8198),    # Singapore
    None, None, None,      # No GPS (weighted toward no GPS)
]


def generate_demo_data(num_photos: int = 5000):
    """Seed the database with realistic demo photo metadata."""
    start_date = datetime(2020, 1, 1)
    end_date = datetime(2024, 12, 31)

    photos = []
    for i in range(num_photos):
        lens_make, lens_model, fixed_fl, fixed_fl35 = random.choice(LENSES)
        body_make, body_model = random.choice(BODIES)

        if fixed_fl:
            focal_length = fixed_fl
            focal_length_35 = fixed_fl35
        else:
            if "24-70" in lens_model:
                focal_length = random.choice([24, 28, 35, 50, 55, 70])
            elif "70-200" in lens_model:
                focal_length = random.choice([70, 85, 100, 135, 200])
            elif "16-35" in lens_model:
                focal_length = random.choice([16, 20, 24, 28, 35])
            else:
                focal_length = 35.0
            focal_length_35 = focal_length

        # Weight toward wider apertures (photographers love bokeh)
        aperture_weights = [3, 5, 4, 3, 4, 3, 2, 2, 1, 1]
        aperture = random.choices(APERTURES, weights=aperture_weights, k=1)[0]

        # Weight toward lower ISOs
        iso_weights = [5, 4, 3, 3, 2, 1, 1]
        iso = random.choices(ISOS, weights=iso_weights, k=1)[0]

        shutter_speed, shutter_sec = random.choice(SHUTTERS)

        # Weighted toward golden hour (17-19) and morning (8-10)
        hours = list(range(24))
        hour_weights = [1, 1, 1, 1, 1, 2, 3, 4, 5, 5, 4, 3, 3, 3, 3, 4, 5, 6, 6, 5, 3, 2, 1, 1]
        hour = random.choices(hours, weights=hour_weights, k=1)[0]

        days_range = (end_date - start_date).days
        random_day = start_date + timedelta(
            days=random.randint(0, days_range),
            hours=hour,
            minutes=random.randint(0, 59),
        )

        location = random.choice(LOCATIONS)

        photo = Photo(
            file_path=f"/demo/photos/{random_day.strftime('%Y/%m/%d')}/DSC{i:05d}.ARW",
            file_name=f"DSC{i:05d}.ARW",
            file_format="ARW",
            camera_make=body_make,
            camera_model=body_model,
            lens_make=lens_make,
            lens_model=lens_model,
            focal_length=focal_length,
            focal_length_35mm=focal_length_35,
            aperture=aperture,
            shutter_speed=shutter_speed,
            shutter_speed_sec=shutter_sec,
            iso=iso,
            date_taken=random_day,
            gps_lat=location[0] + random.uniform(-0.05, 0.05) if location else None,
            gps_lon=location[1] + random.uniform(-0.05, 0.05) if location else None,
            image_width=random.choice([6000, 7008, 8640]),
            image_height=random.choice([4000, 4672, 5760]),
        )
        photos.append(photo)

    with Session(engine) as session:
        for photo in photos:
            session.add(photo)
        session.commit()

    return len(photos)

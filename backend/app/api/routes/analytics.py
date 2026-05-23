from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.database import get_session
from app.services import analytics as svc

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
def overview(session: Session = Depends(get_session)):
    return svc.get_overview(session)


@router.get("/focal-length")
def focal_length(session: Session = Depends(get_session)):
    return svc.get_focal_length_distribution(session)


@router.get("/aperture")
def aperture(lens: str | None = None, session: Session = Depends(get_session)):
    return svc.get_aperture_distribution(session, lens)


@router.get("/iso")
def iso(session: Session = Depends(get_session)):
    return svc.get_iso_distribution(session)


@router.get("/shutter-speed")
def shutter_speed(session: Session = Depends(get_session)):
    return svc.get_shutter_speed_distribution(session)


@router.get("/timeline")
def timeline(
    granularity: str = Query("monthly", pattern="^(daily|weekly|monthly)$"),
    session: Session = Depends(get_session),
):
    return svc.get_timeline(session, granularity)


@router.get("/time-of-day")
def time_of_day(session: Session = Depends(get_session)):
    return svc.get_time_of_day(session)


@router.get("/gear-usage")
def gear_usage(session: Session = Depends(get_session)):
    return svc.get_gear_usage(session)


@router.get("/map")
def map_data(session: Session = Depends(get_session)):
    return svc.get_map_data(session)

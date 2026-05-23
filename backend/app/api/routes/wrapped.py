from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.database import get_session
from app.services.wrapped import generate_wrapped
from app.services.archetypes import classify_archetype

router = APIRouter(prefix="/api/wrapped", tags=["wrapped"])


@router.get("/")
def get_wrapped(year: int | None = None, session: Session = Depends(get_session)):
    return generate_wrapped(session, year)


@router.get("/archetype")
def get_archetype(session: Session = Depends(get_session)):
    return classify_archetype(session)

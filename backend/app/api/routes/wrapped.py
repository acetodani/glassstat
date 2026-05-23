from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.database import get_session
from app.services.wrapped import generate_wrapped
from app.services.archetypes import classify_archetype
from app.services.best_photo import find_best_photo

router = APIRouter(prefix="/api/wrapped", tags=["wrapped"])


@router.get("/")
def get_wrapped(year: Optional[int] = None, session: Session = Depends(get_session)):
    return generate_wrapped(session, year)


@router.get("/archetype")
def get_archetype(session: Session = Depends(get_session)):
    return classify_archetype(session)


@router.get("/best-photo")
def get_best_photo(session: Session = Depends(get_session)):
    """Find the technically best photo using multi-factor scoring."""
    result = find_best_photo(session)
    if not result:
        return {"has_best": False}
    return result

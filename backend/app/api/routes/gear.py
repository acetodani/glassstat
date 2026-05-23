from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.database import get_session
from app.models.gear import Gear, GearUpdate

router = APIRouter(prefix="/api/gear", tags=["gear"])


@router.get("/")
def list_gear(session: Session = Depends(get_session)):
    gear = session.exec(select(Gear)).all()
    return gear


@router.patch("/{gear_id}")
def update_gear(gear_id: int, update: GearUpdate, session: Session = Depends(get_session)):
    gear = session.get(Gear, gear_id)
    if not gear:
        raise HTTPException(404, "Gear not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(gear, key, value)

    session.add(gear)
    session.commit()
    session.refresh(gear)
    return gear

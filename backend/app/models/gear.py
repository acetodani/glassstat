from __future__ import annotations

from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field


class Gear(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str
    make: str
    model: str
    display_name: Optional[str] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[date] = None


class GearUpdate(SQLModel):
    display_name: Optional[str] = None
    purchase_price: Optional[float] = None
    purchase_date: Optional[date] = None

from datetime import date
from sqlmodel import SQLModel, Field


class Gear(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    type: str  # "lens" | "body"
    make: str
    model: str
    display_name: str | None = None
    purchase_price: float | None = None
    purchase_date: date | None = None


class GearUpdate(SQLModel):
    display_name: str | None = None
    purchase_price: float | None = None
    purchase_date: date | None = None

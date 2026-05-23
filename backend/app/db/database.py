from __future__ import annotations

from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

engine = create_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db():
    SQLModel.metadata.create_all(engine)
    # Enable WAL mode for better concurrent reads during writes
    with engine.connect() as conn:
        conn.execute(__import__("sqlalchemy").text("PRAGMA journal_mode=WAL"))
        conn.execute(__import__("sqlalchemy").text("PRAGMA synchronous=NORMAL"))
        conn.commit()


def get_session():
    with Session(engine) as session:
        yield session

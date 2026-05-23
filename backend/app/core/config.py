from __future__ import annotations

from typing import List
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/glassstat.db"
    upload_dir: Path = Path("./data/uploads")
    max_upload_size_mb: int = 100
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = {"env_prefix": "GLASSSTAT_"}


settings = Settings()

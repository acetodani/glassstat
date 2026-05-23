from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/glassstat.db"
    upload_dir: Path = Path("./data/uploads")
    max_upload_size_mb: int = 100
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = {"env_prefix": "GLASSSTAT_"}


settings = Settings()

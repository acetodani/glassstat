import asyncio
from dataclasses import dataclass, field
from pathlib import Path

from app.core.exiftool import find_images


@dataclass
class ScanStatus:
    is_scanning: bool = False
    total_files: int = 0
    processed: int = 0
    errors: int = 0
    current_file: str = ""

    @property
    def progress(self) -> float:
        if self.total_files == 0:
            return 0
        return self.processed / self.total_files


scan_status = ScanStatus()


async def discover_files(directory: str) -> list[Path]:
    path = Path(directory)
    if not path.exists():
        raise FileNotFoundError(f"Directory not found: {directory}")
    if not path.is_dir():
        raise NotADirectoryError(f"Not a directory: {directory}")

    loop = asyncio.get_event_loop()
    files = await loop.run_in_executor(None, find_images, path)
    return files

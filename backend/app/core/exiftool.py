import json
import subprocess
from pathlib import Path


SUPPORTED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".tiff", ".tif",
    ".cr2", ".cr3", ".nef", ".arw", ".orf", ".rw2",
    ".raf", ".dng", ".heif", ".heic", ".avif",
}


def extract_metadata(file_paths: list[Path]) -> list[dict]:
    if not file_paths:
        return []

    cmd = [
        "exiftool",
        "-json",
        "-n",  # numeric values (no formatting)
        "-Make",
        "-Model",
        "-LensMake",
        "-LensModel",
        "-FocalLength",
        "-FocalLengthIn35mmFormat",
        "-FNumber",
        "-ExposureTime",
        "-ISO",
        "-DateTimeOriginal",
        "-GPSLatitude",
        "-GPSLongitude",
        "-ImageWidth",
        "-ImageHeight",
        "-FileType",
        *[str(p) for p in file_paths],
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode != 0 and not result.stdout:
        raise RuntimeError(f"ExifTool failed: {result.stderr}")

    return json.loads(result.stdout)


def find_images(directory: Path) -> list[Path]:
    images = []
    for path in directory.rglob("*"):
        if path.suffix.lower() in SUPPORTED_EXTENSIONS and not path.name.startswith("."):
            images.append(path)
    return sorted(images)

"""
PaperMind AI — Utility Helpers
"""

import logging
import re
from pathlib import Path
from config import PAPERS_DIR, VECTORSTORE_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB

logger = logging.getLogger("papermind.helpers")


def safe_filename(name: str) -> str:
    """Sanitise a filename — keep alphanumeric, hyphens, underscores, dots."""
    name = name.strip()
    name = re.sub(r"[^\w.\-]", "_", name)
    return name


def validate_upload(filename: str, file_size: int) -> str | None:
    """
    Return an error message if the upload is invalid, else None.
    """
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Invalid file type '{ext}'. Only PDF files are allowed."

    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        return f"File too large ({file_size / 1024 / 1024:.1f} MB). Maximum is {MAX_FILE_SIZE_MB} MB."

    return None


def list_uploaded_papers() -> list[dict]:
    """
    Return a list of uploaded papers with their metadata.
    """
    papers: list[dict] = []
    if not PAPERS_DIR.exists():
        return papers

    for pdf in sorted(PAPERS_DIR.glob("*.pdf")):
        has_index = (_vectorstore_exists(pdf.stem))
        papers.append(
            {
                "filename": pdf.name,
                "size_mb": round(pdf.stat().st_size / (1024 * 1024), 2),
                "indexed": has_index,
            }
        )

    return papers


def _vectorstore_exists(paper_stem: str) -> bool:
    """Check if a FAISS index directory exists for this paper."""
    store_dir = VECTORSTORE_DIR / paper_stem.replace(" ", "_")
    return store_dir.exists() and any(store_dir.iterdir())

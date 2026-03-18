"""
PaperMind AI — PDF Loader
Extracts text from PDF files using PyMuPDF, page-by-page.
"""

import logging
from pathlib import Path
from typing import TypedDict

import fitz  # PyMuPDF

logger = logging.getLogger("papermind.pdf_loader")


class PageChunk(TypedDict):
    text: str
    metadata: dict


def extract_text_from_pdf(pdf_path: str | Path) -> list[PageChunk]:
    """
    Extract text from every page of a PDF.

    Returns a list of dicts:
        { "text": "…", "metadata": { "page": 1, "source": "filename.pdf" } }
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    filename = pdf_path.name
    pages: list[PageChunk] = []

    try:
        doc = fitz.open(str(pdf_path))
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            if text:
                pages.append(
                    {
                        "text": text,
                        "metadata": {
                            "page": page_num + 1,
                            "source": filename,
                        },
                    }
                )
        doc.close()
        logger.info("Extracted %d pages from %s", len(pages), filename)
    except Exception as exc:
        logger.error("Failed to extract text from %s: %s", filename, exc)
        raise

    return pages

"""
PaperMind AI — Upload Route
POST /upload  —  save PDF → extract → chunk → embed → store
"""

import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException

from config import PAPERS_DIR
from utils.helpers import safe_filename, validate_upload
from rag.pdf_loader import extract_text_from_pdf
from rag.chunking import chunk_pages
from rag.retriever import build_vectorstore

router = APIRouter()
logger = logging.getLogger("papermind.routes.upload")


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF, extract text, chunk, embed, and index."""
    # ── Validate ─────────────────────────────────────────────────────────
    content = await file.read()
    error = validate_upload(file.filename, len(content))
    if error:
        raise HTTPException(status_code=400, detail=error)

    # ── Save file ────────────────────────────────────────────────────────
    clean_name = safe_filename(file.filename)
    save_path = PAPERS_DIR / clean_name

    save_path.write_bytes(content)
    logger.info("Saved uploaded file: %s (%d bytes)", clean_name, len(content))

    # ── RAG pipeline ─────────────────────────────────────────────────────
    try:
        pages = extract_text_from_pdf(save_path)
        if not pages:
            raise HTTPException(status_code=422, detail="Could not extract any text from the PDF.")

        chunks = chunk_pages(pages)
        paper_key = Path(clean_name).stem
        build_vectorstore(chunks, paper_key)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Processing failed for %s", clean_name)
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")

    return {
        "message": f"'{clean_name}' uploaded and indexed successfully.",
        "filename": clean_name,
        "pages": len(pages),
        "chunks": len(chunks),
    }

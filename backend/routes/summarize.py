"""
PaperMind AI — Summarize Route
POST /summarize  —  return section-wise summaries for a paper
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag.retriever import get_all_documents
from rag.generator import summarize_sections

router = APIRouter()
logger = logging.getLogger("papermind.routes.summarize")


class SummarizeRequest(BaseModel):
    paper_name: str = Field(..., description="Stem name of the uploaded paper (without .pdf)")


@router.post("/summarize")
async def summarize_paper(req: SummarizeRequest):
    """Generate Abstract / Methodology / Results summaries for a paper."""
    try:
        docs = get_all_documents(req.paper_name)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to load documents for summarisation")
        raise HTTPException(status_code=500, detail=f"Error: {exc}")

    full_text = "\n\n".join(d.page_content for d in docs)
    if not full_text.strip():
        raise HTTPException(status_code=422, detail="Paper has no extractable text.")

    try:
        summaries = summarize_sections(full_text)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Summarisation failed")
        raise HTTPException(status_code=500, detail=f"Summarisation error: {exc}")

    return {"paper": req.paper_name, "summaries": summaries}

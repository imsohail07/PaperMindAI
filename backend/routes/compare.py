"""
PaperMind AI — Compare Route
POST /compare  —  compare two research papers
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag.retriever import get_all_documents
from rag.generator import compare_papers

router = APIRouter()
logger = logging.getLogger("papermind.routes.compare")


class CompareRequest(BaseModel):
    paper1: str = Field(..., description="Stem name of the first paper")
    paper2: str = Field(..., description="Stem name of the second paper")


@router.post("/compare")
async def compare_two_papers(req: CompareRequest):
    """Compare two uploaded papers in a structured format."""
    if req.paper1 == req.paper2:
        raise HTTPException(status_code=400, detail="Please select two different papers.")

    try:
        docs1 = get_all_documents(req.paper1)
        docs2 = get_all_documents(req.paper2)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to load documents for comparison")
        raise HTTPException(status_code=500, detail=f"Error: {exc}")

    try:
        comparison = compare_papers(docs1, docs2)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Comparison generation failed")
        raise HTTPException(status_code=500, detail=f"Comparison error: {exc}")

    return {
        "paper1": req.paper1,
        "paper2": req.paper2,
        "comparison": comparison,
    }

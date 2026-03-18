"""
PaperMind AI — Query Route
POST /query  —  retrieve chunks → generate cited answer
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from rag.retriever import retrieve
from rag.generator import generate_answer

router = APIRouter()
logger = logging.getLogger("papermind.routes.query")


class QueryRequest(BaseModel):
    paper_name: str = Field(..., description="Stem name of the uploaded paper (without .pdf)")
    question: str = Field(..., min_length=3, description="User question")


@router.post("/query")
async def query_paper(req: QueryRequest):
    """Answer a question about an uploaded paper with citations."""
    try:
        docs = retrieve(req.paper_name, req.question)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Retrieval failed")
        raise HTTPException(status_code=500, detail=f"Retrieval error: {exc}")

    if not docs:
        return {
            "answer": "No relevant content found in the paper for this question.",
            "citations": [],
        }

    try:
        result = generate_answer(docs, req.question)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Generation failed")
        raise HTTPException(status_code=500, detail=f"Generation error: {exc}")

    return result

"""
PaperMind AI — FastAPI Application Entry Point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.upload import router as upload_router
from routes.query import router as query_router
from routes.summarize import router as summarize_router
from routes.compare import router as compare_router
from utils.helpers import list_uploaded_papers

# Force config-level logging initialisation on import
import config  # noqa: F401

logger = logging.getLogger("papermind.main")

app = FastAPI(
    title="PaperMind AI",
    description="RAG-based AI Research Paper Assistant",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(upload_router, tags=["Upload"])
app.include_router(query_router, tags=["Query"])
app.include_router(summarize_router, tags=["Summarize"])
app.include_router(compare_router, tags=["Compare"])


# ── Root health check ────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "PaperMind AI is running 🚀"}


@app.get("/papers")
async def get_papers():
    """List all uploaded papers and their indexing status."""
    return {"papers": list_uploaded_papers()}

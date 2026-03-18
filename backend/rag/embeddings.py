"""
PaperMind AI — Embedding Provider
Uses Google Generative AI embeddings when an API key is present, otherwise
falls back to a local sentence-transformers model.
"""

import logging
from config import GOOGLE_API_KEY, EMBEDDING_MODEL

logger = logging.getLogger("papermind.embeddings")

_embedding_instance = None


def get_embedding_model():
    """Return a cached LangChain-compatible embedding model."""
    global _embedding_instance
    if _embedding_instance is not None:
        return _embedding_instance

    if GOOGLE_API_KEY:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        logger.info("Using Google Generative AI embeddings: %s", EMBEDDING_MODEL)
        _embedding_instance = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL,
            google_api_key=GOOGLE_API_KEY,
        )
    else:
        from langchain_community.embeddings import HuggingFaceEmbeddings

        fallback_model = "all-MiniLM-L6-v2"
        logger.warning(
            "No GOOGLE_API_KEY found — falling back to sentence-transformers (%s)",
            fallback_model,
        )
        _embedding_instance = HuggingFaceEmbeddings(
            model_name=fallback_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    return _embedding_instance

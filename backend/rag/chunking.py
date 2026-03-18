"""
PaperMind AI — Text Chunking
Splits extracted page text into smaller overlapping chunks, preserving metadata.
"""

import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import CHUNK_SIZE, CHUNK_OVERLAP

logger = logging.getLogger("papermind.chunking")


def chunk_pages(pages: list[dict], chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> list[dict]:
    """
    Split a list of page dicts into smaller chunks.

    Each input dict:  { "text": "...", "metadata": { "page": N, "source": "..." } }
    Returns the same structure with smaller text segments and inherited metadata.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list[dict] = []
    for page in pages:
        texts = splitter.split_text(page["text"])
        for i, t in enumerate(texts):
            chunks.append(
                {
                    "text": t,
                    "metadata": {
                        **page["metadata"],
                        "chunk_index": i,
                    },
                }
            )

    logger.info("Created %d chunks from %d pages", len(chunks), len(pages))
    return chunks

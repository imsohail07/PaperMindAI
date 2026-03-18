"""
PaperMind AI — FAISS Retriever
Manages per-paper FAISS vector stores with save / load / query.
"""

import logging
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from config import VECTORSTORE_DIR, TOP_K
from rag.embeddings import get_embedding_model

logger = logging.getLogger("papermind.retriever")


def _store_path(paper_name: str) -> Path:
    """Return the directory used to persist a paper's vector store."""
    safe = paper_name.replace(" ", "_").replace("..", "")
    return VECTORSTORE_DIR / safe


def build_vectorstore(chunks: list[dict], paper_name: str) -> FAISS:
    """
    Build a FAISS index from chunks and persist it.

    Each chunk dict:  { "text": "...", "metadata": { ... } }
    """
    embeddings = get_embedding_model()
    documents = [
        Document(page_content=c["text"], metadata=c["metadata"])
        for c in chunks
    ]

    logger.info("Building FAISS index for '%s' with %d documents", paper_name, len(documents))
    vectorstore = FAISS.from_documents(documents, embeddings)

    store_dir = _store_path(paper_name)
    store_dir.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(store_dir))
    logger.info("Vector store saved to %s", store_dir)

    return vectorstore


def load_vectorstore(paper_name: str) -> FAISS:
    """Load a previously persisted FAISS index."""
    store_dir = _store_path(paper_name)
    if not store_dir.exists():
        raise FileNotFoundError(f"No vector store found for '{paper_name}' at {store_dir}")

    embeddings = get_embedding_model()
    logger.info("Loading vector store from %s", store_dir)
    return FAISS.load_local(str(store_dir), embeddings, allow_dangerous_deserialization=True)


def retrieve(paper_name: str, query: str, k: int = TOP_K) -> list[Document]:
    """Retrieve top-k relevant documents for a query."""
    vectorstore = load_vectorstore(paper_name)
    results = vectorstore.similarity_search(query, k=k)
    logger.info("Retrieved %d chunks for query on '%s'", len(results), paper_name)
    return results


def get_all_documents(paper_name: str) -> list[Document]:
    """Return all documents stored in a paper's FAISS index."""
    vectorstore = load_vectorstore(paper_name)
    # FAISS docstore stores docs by id
    docs = list(vectorstore.docstore._dict.values())
    logger.info("Loaded %d total documents for '%s'", len(docs), paper_name)
    return docs

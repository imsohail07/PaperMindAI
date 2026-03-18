"""
PaperMind AI — LLM Generator
Provides answer generation (with citations), section summarisation,
and structured paper comparison using Google Gemini.
"""

import json
import logging
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from config import GOOGLE_API_KEY, LLM_MODEL

logger = logging.getLogger("papermind.generator")

MAX_RETRIES = 3
RETRY_WAIT_SECONDS = [30, 60, 90]


def _invoke_with_retry(llm, messages):
    """Invoke the LLM with automatic retry on rate-limit (429) errors."""
    for attempt in range(MAX_RETRIES + 1):
        try:
            return llm.invoke(messages)
        except Exception as exc:
            err_str = str(exc)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                if attempt < MAX_RETRIES:
                    wait = RETRY_WAIT_SECONDS[attempt]
                    logger.warning(
                        "Rate limited (attempt %d/%d). Retrying in %ds...",
                        attempt + 1, MAX_RETRIES, wait,
                    )
                    time.sleep(wait)
                else:
                    logger.error("Rate limit exceeded after %d retries.", MAX_RETRIES)
                    raise RuntimeError(
                        "Google API rate limit exceeded. The free tier has limited "
                        "requests per minute. Please wait 1-2 minutes and try again."
                    ) from exc
            else:
                raise


def _get_llm(temperature: float = 0.2):
    """Return a ChatGoogleGenerativeAI instance."""
    if not GOOGLE_API_KEY:
        raise RuntimeError(
            "GOOGLE_API_KEY is not set. Please add it to your .env file."
        )
    return ChatGoogleGenerativeAI(
        model=LLM_MODEL,
        temperature=temperature,
        google_api_key=GOOGLE_API_KEY,
        convert_system_message_to_human=True,
    )


# ── Q&A with citations ──────────────────────────────────────────────────────

_QA_SYSTEM_PROMPT = """\
You are PaperMind AI, a rigorous research assistant.

RULES — follow them strictly:
1. Answer the user's question ONLY using the provided CONTEXT.
2. If the context does not contain enough information, say:
   "I could not find enough information in the uploaded paper to answer this question."
3. NEVER fabricate facts, statistics, or citations.
4. After your answer, list every source you used as:
   **Citations:**
   - [<source filename> — Page <page number>]
5. Keep answers concise, accurate, and well-structured.

CONTEXT:
{context}
"""


def generate_answer(context_docs: list, query: str) -> dict:
    """
    Generate an answer grounded in retrieved documents.

    Returns: { "answer": "...", "citations": [ { "source": "...", "page": N } ] }
    """
    # Build context block with traceable source markers
    context_parts: list[str] = []
    seen_citations: list[dict] = []
    for doc in context_docs:
        src = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "?")
        context_parts.append(
            f"[{src} — Page {page}]\n{doc.page_content}"
        )
        citation = {"source": src, "page": page}
        if citation not in seen_citations:
            seen_citations.append(citation)

    context_text = "\n\n---\n\n".join(context_parts)

    llm = _get_llm()
    messages = [
        SystemMessage(content=_QA_SYSTEM_PROMPT.format(context=context_text)),
        HumanMessage(content=query),
    ]

    response = _invoke_with_retry(llm, messages)
    answer_text = response.content

    logger.info("Generated answer (%d chars) for query: %s", len(answer_text), query[:80])
    return {"answer": answer_text, "citations": seen_citations}


# ── Section-wise summarisation ───────────────────────────────────────────────

_SUMMARY_SYSTEM_PROMPT = """\
You are PaperMind AI. Summarise the research paper text below into three clear sections.

Return your answer in EXACTLY this JSON format (no markdown fences):
{{
  "abstract": "<concise summary of the paper's abstract / introduction>",
  "methodology": "<summary of the methods, models, or approaches used>",
  "results": "<summary of results, findings, and conclusions>"
}}

RULES:
1. Use ONLY the provided text. Do NOT add external knowledge.
2. If a section is not clearly present, write "Not explicitly described in the paper."
3. Keep each summary between 3-6 sentences.

TEXT:
{text}
"""


def summarize_sections(full_text: str) -> dict:
    """
    Produce section-wise summaries (Abstract, Methodology, Results).

    Returns: { "abstract": "...", "methodology": "...", "results": "..." }
    """
    # Truncate to ~12 000 tokens ≈ 48 000 chars to stay within context limits
    truncated = full_text[:48000]

    llm = _get_llm(temperature=0.1)
    messages = [
        SystemMessage(content=_SUMMARY_SYSTEM_PROMPT.format(text=truncated)),
        HumanMessage(content="Please summarise this paper."),
    ]

    response = _invoke_with_retry(llm, messages)
    raw = response.content.strip()

    # Strip markdown fences if the model wraps them
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON for summarisation; wrapping raw text.")
        result = {
            "abstract": raw,
            "methodology": "Could not parse structured summary.",
            "results": "Could not parse structured summary.",
        }

    logger.info("Generated section summaries for paper.")
    return result


# ── Paper comparison ─────────────────────────────────────────────────────────

_COMPARE_SYSTEM_PROMPT = """\
You are PaperMind AI. Compare the two research papers described below.

Return your answer in EXACTLY this JSON format (no markdown fences):
{{
  "objective":    {{ "paper1": "...", "paper2": "..." }},
  "methodology":  {{ "paper1": "...", "paper2": "..." }},
  "dataset":      {{ "paper1": "...", "paper2": "..." }},
  "results":      {{ "paper1": "...", "paper2": "..." }},
  "advantages":   {{ "paper1": "...", "paper2": "..." }},
  "limitations":  {{ "paper1": "...", "paper2": "..." }}
}}

RULES:
1. Only use the provided context for each paper.
2. If information is missing for a field, write "Not described in the paper."
3. Be concise and specific.

PAPER 1:
{context1}

PAPER 2:
{context2}
"""


def compare_papers(context1_docs: list, context2_docs: list) -> dict:
    """
    Compare two papers based on their retrieved documents.

    Returns structured JSON with keys: objective, methodology, dataset,
    results, advantages, limitations — each with paper1/paper2 sub-keys.
    """
    ctx1 = "\n\n".join(d.page_content for d in context1_docs)[:24000]
    ctx2 = "\n\n".join(d.page_content for d in context2_docs)[:24000]

    llm = _get_llm(temperature=0.15)
    messages = [
        SystemMessage(content=_COMPARE_SYSTEM_PROMPT.format(context1=ctx1, context2=ctx2)),
        HumanMessage(content="Compare these two papers."),
    ]

    response = _invoke_with_retry(llm, messages)
    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON for comparison; wrapping raw text.")
        result = {"raw_comparison": raw}

    logger.info("Generated paper comparison.")
    return result

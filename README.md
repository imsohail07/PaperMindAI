# PaperMind AI

[![CI](https://github.com/imsohail07/PaperMindAI/actions/workflows/ci.yml/badge.svg)](https://github.com/imsohail07/PaperMindAI/actions/workflows/ci.yml)

PaperMind AI is a production-grade **Retrieval-Augmented Generation (RAG)** application designed to accelerate research document analysis. It allows users to ingest complex PDF papers, perform context-aware queries, generate structured summaries, and run comparative evaluations between multiple documents. 

## Core Architecture & Stack

The application is built on a modern AI/web stack, optimizing for rapid document processing and high-accuracy LLM inference.

### Backend Infrastructure
- **FastAPI / Python:** High-performance async REST API framework handling orchestration.
- **LangChain:** Core framework connecting the RAG pipeline (document loading, text splitting, embeddings generation).
- **FAISS (Facebook AI Similarity Search):** In-memory vector database used for rapid semantic similarity lookups.
- **PyMuPDF:** Highly efficient library used for deep text extraction from PDF documents, preserving spatial context.
- **Google Generative AI (Gemini Flash):** Default LLM and embedding provider chosen for low-latency reasoning and large context windows.

### Frontend Interface
- **React (Vite):** Fast, modern frontend framework handling the SPA architecture.
- **Tailwind CSS & Framer Motion:** Utility-first styling combined with physics-based animations for a premium, responsive UI.
- **Axios:** Promise-based HTTP client for decoupled backend communication.

---

## Primary Use Cases

1. **Automated Ingestion:** Drag-and-drop a research paper. The system automatically extracts text, chunks it, generates vector embeddings, and indexes it within seconds.
2. **Context-Grounded Q&A:** Ask complex questions about the paper. The system retrieves relevant chunks via FAISS and feeds them to the LLM to generate precise, cited answers.
3. **Structured Summarization:** Instantly distills dense papers into standardized sections (Abstract, Methodology, Results) for rapid literature review.
4. **Comparative Analysis:** Select two uploaded papers and the system produces a side-by-side evaluation table highlighting differences in objective, dataset, methodology, and limitations.

---

## Deployment & Local Setup

### 1. Environment Configuration

Clone the repository and configure the required environment variables.

```bash
cd paper-mind-ai
cp backend/.env.example backend/.env
```

Ensure your `backend/.env` file contains your valid Google AI credentials:
```env
GOOGLE_API_KEY=your_google_ai_studio_key_here
LLM_MODEL=gemini-2.0-flash
EMBEDDING_MODEL=models/gemini-embedding-2-preview
CHUNK_SIZE=800
CHUNK_OVERLAP=100
TOP_K=5
MAX_FILE_SIZE_MB=50
```

### 2. Backend Initialization

Provision the Python environment and start the ASGI server:

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Unix/macOS
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The API becomes accessible at `http://localhost:8000`. Auto-generated Swagger documentation is available at `/docs`.

### 3. Frontend Initialization

Launch the Vite build tool and development server:

```bash
cd frontend
npm install
npm run dev
```
The client application runs at `http://localhost:5173`. API proxying is handled natively by Vite.

---

## License

Subject to MIT License terms and conditions.

"""
api.py — FastAPI application entry point for NeuralChat backend.

Endpoints:
  GET  /              → Health check
  GET  /health        → Health check (JSON)
  POST /api/llm       → Direct LLM call (no RAG)
  POST /api/query     → RAG query (vector search + LLM answer)
  POST /api/ingest    → Upload and ingest a document into ChromaDB
"""

import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm import llm_call
from vector import query_chroma_db, generate_answer, extract_text, chunk_documents, store_embeddings

# ==========================================================
# APP INIT
# ==========================================================

app = FastAPI(
    title="NeuralChat API",
    description="RAG-powered AI chatbot backend — TCS Demo",
    version="1.0.0",
)

# ==========================================================
# CORS — allow React frontend on localhost:3000
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# REQUEST MODELS
# ==========================================================

class PromptRequest(BaseModel):
    prompt: str

class QueryRequest(BaseModel):
    query: str

# ==========================================================
# ROUTES
# ==========================================================

@app.get("/")
def root():
    return {"status": "ok", "message": "NeuralChat API is running. Visit /docs for API reference."}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "NeuralChat Backend"}


@app.post("/api/llm")
def call_llm(body: PromptRequest):
    """
    Direct LLM call without vector search.
    Body: { "prompt": "your question" }
    """
    if not body.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    result = llm_call(body.prompt)
    return {"result": result}


@app.post("/api/query")
def run_query(body: QueryRequest):
    """
    RAG query: vector search → context retrieval → LLM answer generation.
    Body: { "query": "your question" }
    Returns: { "answer": "...", "docs": ["chunk1", "chunk2", ...] }
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    docs = query_chroma_db(body.query)
    answer = generate_answer(body.query, docs)

    return {
        "answer": answer,
        "docs": [d.page_content for d in docs],
        "sources_count": len(docs),
    }


@app.post("/api/ingest")
def ingest_document(file: UploadFile = File(...)):
    """
    Upload a .txt, .pdf, or .docx file and ingest it into ChromaDB.
    Returns a success message with chunk count.
    """
    allowed_exts = {".txt", ".pdf", ".docx", ".doc"}
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(allowed_exts)}"
        )

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        documents = extract_text(tmp_path)
        chunks = chunk_documents(documents)
        store_embeddings(chunks)
        return {
            "status": "success",
            "filename": file.filename,
            "pages": len(documents),
            "chunks": len(chunks),
            "message": f"Successfully ingested '{file.filename}' into ChromaDB ({len(chunks)} chunks)."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

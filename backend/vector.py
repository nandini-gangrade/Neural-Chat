"""
vector.py — Document ingestion, chunking, embedding, and retrieval logic.

Supports: .txt, .pdf, .docx/.doc files
Vector DB: ChromaDB (persisted locally in chroma_db/)
Embeddings: OpenAI-compatible (Azure or OpenAI)
"""

import os
import httpx
from dotenv import load_dotenv
from typing import List

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredWordDocumentLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.documents import Document

from llm import llm_call

# ==========================================================
# ENV + TIKTOKEN CACHE SETUP
# ==========================================================

load_dotenv()

API_ENDPOINT = os.getenv("API_ENDPOINT")
API_KEY = os.getenv("API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
VERIFY_SSL = os.getenv("VERIFY_SSL", "true").lower() != "false"

# Use local tiktoken cache (already bundled — no internet needed)
TIKTOKEN_CACHE_DIR = os.path.join(os.path.dirname(__file__), "tiktoken_cache")
os.makedirs(TIKTOKEN_CACHE_DIR, exist_ok=True)
os.environ["TIKTOKEN_CACHE_DIR"] = TIKTOKEN_CACHE_DIR

http_client = httpx.Client(verify=VERIFY_SSL)

# Default ChromaDB path (relative to this file)
DEFAULT_CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")


# ==========================================================
# 1. DOCUMENT TEXT EXTRACTION
# ==========================================================

def extract_text(file_path: str) -> List[Document]:
    """
    Extract text from .txt, .pdf, or .docx/.doc files.
    Returns a list of LangChain Document objects.
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        loader = TextLoader(file_path, encoding="utf-8")
    elif ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext in [".docx", ".doc"]:
        loader = UnstructuredWordDocumentLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: '{ext}'. Supported: .txt, .pdf, .docx, .doc")

    documents = loader.load()
    print(f"[vector] Loaded {len(documents)} page(s) from '{file_path}'")
    return documents


# ==========================================================
# 2. CHUNKING WITH CONTEXT PRESERVATION
# ==========================================================

def chunk_documents(
    documents: List[Document],
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[Document]:
    """
    Split documents into overlapping chunks to preserve semantic context.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_documents(documents)
    print(f"[vector] Created {len(chunks)} chunks from {len(documents)} document(s)")
    return chunks


# ==========================================================
# 3. CREATE EMBEDDINGS MODEL
# ==========================================================

def get_embedding_model() -> OpenAIEmbeddings:
    """
    Initialize and return the embedding model instance.
    """
    embeddings = OpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        api_key=API_KEY,
        base_url=API_ENDPOINT,
        http_client=http_client,
    )
    return embeddings


# ==========================================================
# 4. STORE EMBEDDINGS IN CHROMA DB
# ==========================================================

def store_embeddings(
    documents: List[Document],
    persist_dir: str = DEFAULT_CHROMA_DIR,
) -> Chroma:
    """
    Embed and store documents into ChromaDB.
    The database is persisted at `persist_dir`.
    """
    embeddings = get_embedding_model()

    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=persist_dir,
    )

    print(f"[vector] Stored {len(documents)} chunks in ChromaDB at '{persist_dir}'")
    return vectorstore


# ==========================================================
# 5. QUERY CHROMA DB
# ==========================================================

def query_chroma_db(
    query: str,
    persist_dir: str = DEFAULT_CHROMA_DIR,
    k: int = 5,
) -> List[Document]:
    """
    Load ChromaDB and retrieve the top-k most relevant document chunks
    for the given query using similarity search.
    """
    embeddings = get_embedding_model()

    vectorstore = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings,
    )

    results = vectorstore.similarity_search(query, k=k)
    print(f"[vector] Query returned {len(results)} document(s)")
    return results


# ==========================================================
# 6. GENERATE ANSWER FROM RETRIEVED CONTEXT
# ==========================================================

def generate_answer(query: str, docs: List[Document]) -> str:
    """
    Build a prompt from retrieved document chunks and call the LLM
    to produce a final grounded answer.
    """
    if not docs:
        return "No relevant documents found in the knowledge base for your query."

    context = "\n\n".join(doc.page_content for doc in docs)

    prompt = f"""Answer the question using ONLY the context provided below.
If the answer is not contained in the context, say "I don't have enough information to answer this."

Context:
{context}

Question:
{query}

Answer:"""

    response = llm_call(prompt)
    return response


# ==========================================================
# MAIN — for standalone testing
# ==========================================================

def main():
    print("=== NeuralChat Vector Module Test ===\n")

    # Test query against existing ChromaDB
    query = "What was the net profit for Q4 FY25?"
    print(f"Query: {query}\n")

    retrieved_docs = query_chroma_db(query)

    print("Retrieved Context Snippets:")
    for i, doc in enumerate(retrieved_docs, 1):
        print(f"  [{i}] {doc.page_content[:200]}...")
        print()

    answer = generate_answer(query, retrieved_docs)
    print("\n🧠 Final Answer:")
    print(answer)


if __name__ == "__main__":
    main()

/**
 * api.js — Centralized Backend API Service
 *
 * All calls to the FastAPI backend go through this file.
 * Backend base URL: http://localhost:8000
 *
 * Endpoints used:
 *   POST /api/query  — RAG query (vector search + LLM answer)
 *   POST /api/llm    — Direct LLM call (no RAG)
 *   POST /api/ingest — Upload a document to ChromaDB
 *   GET  /health     — Health check
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s timeout (LLM calls can be slow)
});

// ── Response interceptor: normalize errors ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Backend returned an error response
      const detail = error.response.data?.detail || error.response.statusText;
      throw new Error(`API Error ${error.response.status}: ${detail}`);
    } else if (error.request) {
      // No response received — backend likely not running
      throw new Error(
        'Cannot connect to backend. Make sure the FastAPI server is running on http://localhost:8000'
      );
    } else {
      throw new Error(error.message || 'Unknown API error');
    }
  }
);

// ── API Functions ──────────────────────────────────────────

/**
 * RAG Query — vector search + LLM answer generation.
 * Calls POST /api/query with { query: string }
 * Returns { answer: string, docs: string[], sources_count: number }
 */
export const sendQuery = async (query) => {
  const response = await api.post('/api/query', { query });
  return response.data;
};

/**
 * Direct LLM call — no vector search, just the LLM.
 * Calls POST /api/llm with { prompt: string }
 * Returns { result: string }
 */
export const sendLLMPrompt = async (prompt) => {
  const response = await api.post('/api/llm', { prompt });
  return response.data;
};

/**
 * Ingest a document into ChromaDB.
 * Calls POST /api/ingest with multipart/form-data
 * Returns { status, filename, pages, chunks, message }
 */
export const ingestDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Health check — verify backend is reachable.
 * Calls GET /health
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

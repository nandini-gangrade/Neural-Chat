#!/bin/bash
# =============================================================
# NeuralChat Backend — Start Script
# =============================================================
# Usage: bash start.sh
# Starts the FastAPI server on http://localhost:8000

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       NeuralChat Backend Starting...     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check .env exists
if [ ! -f ".env" ]; then
  echo "❌ ERROR: .env file not found!"
  echo "   Please copy .env and fill in your API_ENDPOINT, API_KEY, LLM_MODEL, EMBEDDING_MODEL"
  exit 1
fi

# Check API_KEY is set
source .env
if [ -z "$API_KEY" ]; then
  echo "⚠️  WARNING: API_KEY is empty in .env — LLM calls will fail."
  echo "   Fill in your credentials and restart."
fi

echo "✅ Starting FastAPI on http://localhost:8000"
echo "   Swagger docs: http://localhost:8000/docs"
echo ""

uvicorn api:app --host 0.0.0.0 --port 8000 --reload

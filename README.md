# NeuralChat — Full-Stack AI RAG Chatbot

> **Tech Stack:** FastAPI · LangChain · ChromaDB · OpenAI/Azure · React.js  
> **Type:** RAG (Retrieval Augmented Generation) AI Chatbot  
> **Demo-ready for:** Hackathons · Technical Interviews · TCS Presentations

---

## Project Structure

```
NeuralChat/
├── backend/
│   ├── api.py              ← FastAPI app (main entry point)
│   ├── llm.py              ← LLM call wrapper (LangChain + OpenAI)
│   ├── vector.py           ← Document ingestion, chunking, ChromaDB queries
│   ├── strings.py          ← System prompts and string constants
│   ├── sample.txt          ← Sample document for testing
│   ├── requirements.txt    ← Python dependencies
│   ├── start.sh            ← Backend startup script
│   ├── .env                ← 🔑 ADD YOUR CREDENTIALS HERE
│   ├── chroma_db/          ← Persisted ChromaDB vector store
│   │   └── chroma.sqlite3
│   └── tiktoken_cache/     ← Local tokenizer cache (offline support)
│       └── 9b5ad71b...
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx       ← Login page (mock auth)
    │   │   ├── Register.jsx    ← Registration page
    │   │   └── Chat.jsx        ← Main chatbot interface
    │   ├── components/
    │   │   ├── Navbar.jsx       ← Top navigation bar
    │   │   ├── ChatBubble.jsx   ← Individual message bubble
    │   │   └── UploadModal.jsx  ← Document upload modal
    │   ├── services/
    │   │   ├── api.js           ← All API calls centralized
    │   │   └── auth.js          ← Mock auth logic
    │   ├── App.jsx              ← Router + route guards
    │   ├── index.js             ← React entry point
    │   └── index.css            ← Global styles + CSS variables
    └── package.json
```

---

## Step 1 — Add Your Credentials

Edit `backend/.env`:

```env
API_ENDPOINT="https://your-resource.openai.azure.com/"
API_KEY="your-api-key-here"
LLM_MODEL="azure/genailab-maas-gpt-4.1"
EMBEDDING_MODEL="azure/genailab-maas-text-embedding-3-large"
VERIFY_SSL=false
```

> `VERIFY_SSL=false` disables SSL verification — needed for corporate proxies.

---

## Step 2 — Start the Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# Or use the script
bash start.sh
```

Backend runs at: **http://localhost:8000**  
Swagger UI at:   **http://localhost:8000/docs**

---

## Step 3 — Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## How Authentication Works

Authentication is **fully frontend-based (mock)** — no backend required.

| Step | What happens |
|---|---|
| Register | User `{ name, email, password }` saved to `localStorage['nc_users']` |
| Login | Credentials checked against `localStorage['nc_users']` |
| Session | `{ name, email }` object saved to `localStorage['nc_session']` |
| Route guard | `App.jsx` reads `nc_session` — redirects to `/login` if absent |
| Logout | `nc_session` removed from `localStorage` |

**Default demo account** (auto-seeded):
- Email: `demo@neuralchat.ai`
- Password: `demo1234`

---

## How RAG Works (Backend Flow)

```
User Query
    │
    ▼
POST /api/query { "query": "..." }
    │
    ├─► query_chroma_db()
    │       Embeds query → similarity search in ChromaDB
    │       Returns top-5 most relevant document chunks
    │
    └─► generate_answer()
            Builds prompt: context + query
            Calls LLM → returns grounded answer
    │
    ▼
{ "answer": "...", "docs": [...], "sources_count": 5 }
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check (root) |
| GET | `/health` | JSON health check |
| POST | `/api/query` | RAG query — vector search + LLM answer |
| POST | `/api/llm` | Direct LLM call (no retrieval) |
| POST | `/api/ingest` | Upload & ingest a document into ChromaDB |

### POST /api/query
```json
// Request
{ "query": "What is the net profit for Q4?" }

// Response
{
  "answer": "Based on the context...",
  "docs": ["chunk1...", "chunk2..."],
  "sources_count": 5
}
```

### POST /api/ingest
Send as `multipart/form-data` with field `file`.  
Accepts: `.txt`, `.pdf`, `.docx`, `.doc`

---

## What Was Fixed From Original Code

| File | Issue | Fix |
|------|-------|-----|
| `vector.py` | Line 105 had orphaned code `vectors = embedding_model.embed_documents(...)` outside any function — **syntax error** | Removed orphaned line |
| `vector.py` | Used `langchain_community.vectorstores.Chroma` (deprecated) | Updated to `langchain_chroma.Chroma` |
| `vector.py` | `store_embeddings` called `vectorstore.persist()` which is deprecated in new LangChain | Removed deprecated call |
| `vector.py` | Hardcoded relative paths for chroma_db | Made paths relative to `__file__` so they work from any working directory |
| `llm.py` | `VERIFY_SSL` not read from env | Added env-based SSL toggle |
| `api.py` | No health check, no ingest endpoint | Added `/health` and `/api/ingest` |
| `requirements.txt` | Duplicates, missing packages | Cleaned and added `fastapi`, `uvicorn`, `langchain-chroma`, `python-multipart` |

---

## Frontend Features

- **Login / Register** — mock auth with localStorage, animated forms
- **Chat interface** — animated message bubbles, typing indicator, auto-scroll
- **Sidebar** — live backend status, mode toggle (RAG vs Direct LLM), query suggestions
- **Upload modal** — drag-and-drop document ingestion into ChromaDB
- **Source count badge** — shows how many document chunks were retrieved
- **Error handling** — clear error messages if backend is down
- **Route protection** — unauthenticated users redirected to `/login`
- **Responsive input** — auto-expanding textarea, Enter to send

---

## Troubleshooting

**CORS error?**  
Make sure the backend's CORS middleware allows `http://localhost:3000` (already configured in `api.py`).

**Backend not starting?**  
Ensure all packages are installed: `pip install -r requirements.txt`

**ChromaDB error?**  
The `chroma_db/` folder is already included with pre-existing embeddings. If you want to re-ingest documents, use the Upload button in the UI or call `POST /api/ingest`.

**SSL error?**  
Set `VERIFY_SSL=false` in your `.env` file.

**tiktoken error?**  
The `tiktoken_cache/` folder is bundled — tokenizer works offline. If missing, run:  
`TIKTOKEN_CACHE_DIR=./tiktoken_cache python -c "import tiktoken; tiktoken.get_encoding('cl100k_base')"`

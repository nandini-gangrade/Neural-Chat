import React, { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import ChatBubble from '../components/ChatBubble';
import UploadModal from '../components/UploadModal';
import { sendQuery } from '../services/api';
import { checkHealth } from '../services/api';

// ── Constants ───────────────────────────────────────────────

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I'm NeuralChat — your AI-powered knowledge engine.\n\nI use Retrieval Augmented Generation (RAG) to search through a ChromaDB vector database and give you precise, grounded answers from the ingested documents.\n\nAsk me anything, or try one of the suggestions on the left.`,
};

const SUGGESTIONS = [
  'What topics are in the knowledge base?',
  'Summarize the main content available.',
  'What is Retrieval Augmented Generation?',
  'What is TCS and what does it do?',
  'Explain what vector embeddings are.',
];

// ── Component ───────────────────────────────────────────────

export default function Chat() {
  const [messages, setMessages]       = useState([WELCOME]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showUpload, setShowUpload]   = useState(false);
  const [backendUp, setBackendUp]     = useState(null); // null=checking, true, false
  const [mode, setMode]               = useState('rag'); // 'rag' | 'llm'

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const msgIdRef    = useRef(1);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setBackendUp(true))
      .catch(() => setBackendUp(false));
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const addMessage = useCallback((role, content, extras = {}) => {
    const id = msgIdRef.current++;
    setMessages((prev) => [...prev, { id, role, content, ...extras }]);
  }, []);

  const handleSend = useCallback(async (queryText) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    setInput('');
    addMessage('user', q);
    setLoading(true);

    try {
      const data = await sendQuery(q);
      const answer = data.answer || data.result || data.response || JSON.stringify(data);
      addMessage('assistant', answer, { sourcesCount: data.sources_count || 0 });
    } catch (err) {
      addMessage('assistant',
        `⚠ Connection error: ${err.message}\n\nMake sure the FastAPI backend is running:\n  cd backend && uvicorn api:app --reload`,
        { isError: true }
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading, addMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME]);
    setInput('');
  };

  const focusIn  = (e) => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; };
  const focusOut = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={c.page}>
      <Navbar onUploadClick={() => setShowUpload(true)} />

      <div style={c.body}>
        {/* ── Sidebar ── */}
        <aside style={c.sidebar}>
          {/* New Chat */}
          <button
            style={c.newChatBtn}
            onClick={handleNewChat}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-cyan-dim)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-violet)'; }}
          >
            + New Chat
          </button>

          {/* Backend status */}
          <div style={c.sideSection}>
            <div style={c.sideTitle}>System Status</div>
            <StatusItem label="Backend API" up={backendUp} />
            <StatusItem label="ChromaDB" up={backendUp} />
            <StatusItem label="LLM Ready" up={backendUp} />
          </div>

          <div style={c.sideDivider} />

          {/* Mode toggle */}
          <div style={c.sideSection}>
            <div style={c.sideTitle}>Query Mode</div>
            <div style={c.modeToggle}>
              <button
                style={c.modeBtn(mode === 'rag')}
                onClick={() => setMode('rag')}
              >
                ⬡ RAG
              </button>
              <button
                style={c.modeBtn(mode === 'llm')}
                onClick={() => setMode('llm')}
              >
                ◆ Direct
              </button>
            </div>
            <div style={c.modeDesc}>
              {mode === 'rag'
                ? 'Vector search → LLM answer (recommended)'
                : 'LLM only, no document retrieval'}
            </div>
          </div>

          <div style={c.sideDivider} />

          {/* Suggestions */}
          <div style={c.sideSection}>
            <div style={c.sideTitle}>Try These</div>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                style={c.suggBtn}
                disabled={loading}
                onClick={() => handleSend(s)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={c.sideDivider} />

          {/* API info */}
          <div style={c.sideSection}>
            <div style={c.sideTitle}>API Endpoints</div>
            <div style={c.apiTag}>POST /api/query</div>
            <div style={c.apiTag}>POST /api/ingest</div>
            <div style={c.apiTagMuted}>localhost:8000</div>
          </div>
        </aside>

        {/* ── Main Chat ── */}
        <main style={c.main}>
          {/* Messages */}
          <div style={c.messages}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={c.typingWrapper}>
                <div style={c.typingLabel}>⬡ NeuralChat</div>
                <div style={c.typingBubble}>
                  <div style={c.dot(0)} />
                  <div style={c.dot(0.2)} />
                  <div style={c.dot(0.4)} />
                  <span style={c.typingText}>Searching knowledge base...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={c.inputArea}>
            <div style={c.inputRow}>
              <textarea
                ref={textareaRef}
                style={c.textarea}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={focusIn}
                onBlur={focusOut}
                placeholder="Ask anything about the knowledge base..."
                rows={1}
                disabled={loading}
              />
              <button
                style={c.sendBtn(!input.trim() || loading)}
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                title="Send (Enter)"
              >
                {loading
                  ? <div style={c.sendSpinner} />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                }
              </button>
            </div>

            <div style={c.inputHint}>
              Enter to send · Shift+Enter for newline · Mode: <strong style={{ color: 'var(--accent-cyan)' }}>{mode.toUpperCase()}</strong>
            </div>
          </div>
        </main>
      </div>

      {/* Upload modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

// ── Status indicator sub-component ──────────────────────────

function StatusItem({ label, up }) {
  const color = up === null ? '#facc15' : up ? '#22d3ee' : '#f87171';
  const text  = up === null ? 'Checking...' : up ? 'Online' : 'Offline';
  return (
    <div style={si.row}>
      <div style={si.dot(color)} />
      <span style={si.label}>{label}</span>
      <span style={si.status(color)}>{text}</span>
    </div>
  );
}

const si = {
  row: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '7px 10px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    marginBottom: '5px',
  },
  dot: (color) => ({
    width: '7px', height: '7px', borderRadius: '50%',
    background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0,
  }),
  label: { fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', flex: 1 },
  status: (color) => ({ fontSize: '10px', fontFamily: 'var(--font-mono)', color }),
};

// ── Styles ──────────────────────────────────────────────────

const c = {
  page: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    background: 'var(--bg-deep)', overflow: 'hidden',
  },
  body: {
    flex: 1, display: 'flex', overflow: 'hidden',
  },
  sidebar: {
    width: '250px', flexShrink: 0,
    borderRight: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    overflowY: 'auto', padding: '16px 12px',
    display: 'flex', flexDirection: 'column', gap: '0',
  },
  newChatBtn: {
    width: '100%', padding: '10px 14px',
    borderRadius: 'var(--radius)', border: '1px solid var(--border-violet)',
    background: 'transparent', color: 'var(--accent-cyan)',
    fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: '700',
    cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px',
    letterSpacing: '0.03em',
  },
  sideSection: { marginBottom: '4px' },
  sideTitle: {
    fontSize: '9px', fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.18em', marginBottom: '8px', paddingLeft: '2px',
  },
  sideDivider: { height: '1px', background: 'var(--border)', margin: '14px 0' },
  modeToggle: { display: 'flex', gap: '6px', marginBottom: '8px' },
  modeBtn: (active) => ({
    flex: 1, padding: '7px 0',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border)'}`,
    background: active ? 'var(--accent-cyan-dim)' : 'transparent',
    color: active ? 'var(--accent-cyan)' : 'var(--text-muted)',
    fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s',
  }),
  modeDesc: {
    fontSize: '10px', fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)', lineHeight: '1.5',
    padding: '0 2px', marginBottom: '4px',
  },
  suggBtn: {
    width: '100%', padding: '9px 11px', marginBottom: '5px',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: '11px', fontFamily: 'var(--font-mono)',
    cursor: 'pointer', textAlign: 'left', lineHeight: '1.4',
    transition: 'all 0.15s',
  },
  apiTag: {
    padding: '4px 9px', marginBottom: '4px',
    borderRadius: '4px', background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    fontSize: '10px', fontFamily: 'var(--font-mono)',
    color: 'var(--accent-cyan)',
  },
  apiTagMuted: {
    padding: '4px 9px',
    fontSize: '10px', fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '28px 32px',
    display: 'flex', flexDirection: 'column', gap: '22px',
  },
  typingWrapper: {
    display: 'flex', flexDirection: 'column', gap: '5px',
  },
  typingLabel: {
    fontSize: '10px', fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.12em', paddingLeft: '4px',
  },
  typingBubble: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '14px 18px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '18px 18px 18px 4px',
    width: 'fit-content',
  },
  dot: (delay) => ({
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'var(--accent-cyan)',
    animation: 'pulse 1.4s infinite',
    animationDelay: `${delay}s`,
    flexShrink: 0,
  }),
  typingText: {
    fontSize: '11px', fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)', marginLeft: '6px',
  },
  inputArea: {
    padding: '14px 28px 20px',
    borderTop: '1px solid var(--border)',
    background: 'rgba(5,5,13,0.85)',
    backdropFilter: 'blur(20px)',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex', gap: '10px', alignItems: 'flex-end',
  },
  textarea: {
    flex: 1, padding: '13px 17px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: '14px', fontFamily: 'var(--font-mono)',
    outline: 'none', resize: 'none',
    lineHeight: '1.6', maxHeight: '140px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    overflowY: 'auto',
  },
  sendBtn: (disabled) => ({
    width: '46px', height: '46px',
    borderRadius: '12px', border: 'none',
    background: disabled
      ? 'var(--bg-card)'
      : 'linear-gradient(135deg, var(--accent-violet), #3730a3)',
    color: disabled ? 'var(--text-muted)' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    boxShadow: disabled ? 'none' : 'var(--shadow-violet)',
    transition: 'all 0.2s',
  }),
  sendSpinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  inputHint: {
    fontSize: '10px', fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)', textAlign: 'center',
    marginTop: '9px', letterSpacing: '0.03em',
  },
};

import React, { useState, useRef } from 'react';
import { ingestDocument } from '../services/api';

/**
 * UploadModal — drag-and-drop / file picker to ingest documents into ChromaDB.
 * Props:
 *   onClose: () => void
 */
export default function UploadModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      const data = await ingestDocument(file);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed.');
      setStatus('error');
    }
  };

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={m.header}>
          <div>
            <div style={m.title}>Upload Document</div>
            <div style={m.subtitle}>Ingest a file into the ChromaDB knowledge base</div>
          </div>
          <button style={m.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Drop zone */}
        <div
          style={m.dropZone(dragging)}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf,.docx,.doc"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div style={m.dropIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          {file ? (
            <div style={m.fileName}>
              <span style={m.fileNameText}>{file.name}</span>
              <span style={m.fileSize}>({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div style={m.dropText}>
              <div>Drag & drop a file here or <span style={{ color: 'var(--accent-cyan)' }}>click to browse</span></div>
              <div style={m.dropSub}>Supported: .txt, .pdf, .docx, .doc</div>
            </div>
          )}
        </div>

        {/* Status messages */}
        {status === 'success' && result && (
          <div style={m.successBox}>
            <div style={m.successTitle}>✓ Ingested Successfully</div>
            <div style={m.successDetail}>
              <span>{result.pages} page(s)</span>
              <span style={m.dot} />
              <span>{result.chunks} chunks</span>
              <span style={m.dot} />
              <span>stored in ChromaDB</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={m.errorBox}>⚠ {errorMsg}</div>
        )}

        {/* Actions */}
        <div style={m.actions}>
          <button style={m.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={m.uploadBtn(status === 'uploading' || !file)}
            onClick={handleSubmit}
            disabled={status === 'uploading' || !file}
          >
            {status === 'uploading' ? (
              <span style={m.spinner} />
            ) : status === 'success' ? (
              '✓ Done'
            ) : (
              'Upload & Ingest'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const m = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    marginTop: '3px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  dropZone: (dragging) => ({
    border: `2px dashed ${dragging ? 'var(--accent-cyan)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    background: dragging ? 'var(--accent-cyan-dim)' : 'var(--bg-surface)',
    transition: 'all 0.2s',
    color: 'var(--text-secondary)',
  }),
  dropIcon: {
    color: 'var(--accent-cyan)',
    opacity: 0.7,
  },
  dropText: {
    textAlign: 'center',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  dropSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  fileName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
  },
  fileNameText: {
    color: 'var(--accent-cyan)',
    fontWeight: '500',
  },
  fileSize: {
    color: 'var(--text-muted)',
  },
  successBox: {
    padding: '14px 16px',
    borderRadius: 'var(--radius)',
    background: 'rgba(0,229,255,0.07)',
    border: '1px solid rgba(0,229,255,0.25)',
  },
  successTitle: {
    color: 'var(--accent-cyan)',
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '6px',
  },
  successDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
  },
  dot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--text-muted)',
  },
  errorBox: {
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '9px 20px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  uploadBtn: (disabled) => ({
    padding: '9px 22px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: disabled
      ? 'var(--bg-surface)'
      : 'linear-gradient(135deg, var(--accent-violet), #3730a3)',
    color: disabled ? 'var(--text-muted)' : '#fff',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : 'var(--shadow-violet)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  }),
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

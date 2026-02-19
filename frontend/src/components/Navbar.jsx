import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '../services/auth';

export default function Navbar({ onUploadClick }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav style={nav.bar}>
      {/* Logo */}
      <div style={nav.logo}>
        <div style={nav.logoMark}>N</div>
        <div>
          <div style={nav.logoText}>NeuralChat</div>
          <div style={nav.logoSub}>RAG · LangChain · ChromaDB</div>
        </div>
      </div>

      {/* Right side */}
      <div style={nav.right}>
        {/* Upload button */}
        {onUploadClick && (
          <button
            style={nav.uploadBtn}
            onClick={onUploadClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
              e.currentTarget.style.background = 'var(--accent-cyan-dim)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Upload document to knowledge base"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Doc
          </button>
        )}

        {/* User badge */}
        {user && (
          <div style={nav.userBadge}>
            <div style={nav.avatar}>{initials}</div>
            <div style={nav.userInfo}>
              <div style={nav.userName}>{user.name}</div>
              <div style={nav.userEmail}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          style={nav.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#f87171';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

const nav = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '62px',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(5, 5, 13, 0.9)',
    backdropFilter: 'blur(20px)',
    flexShrink: 0,
    position: 'relative',
    zIndex: 10,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0,229,255,0.25)',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '9px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.01em',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '6px 12px',
    borderRadius: '30px',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  userEmail: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    lineHeight: 1.2,
  },
  logoutBtn: {
    padding: '7px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '11px',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};

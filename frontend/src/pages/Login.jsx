import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      loginUser(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const focusIn  = (e) => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; };
  const focusOut = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={p.page}>
      {/* Background glows */}
      <div style={p.glow1} />
      <div style={p.glow2} />
      <div style={p.grid} />

      <div style={p.card}>
        <div style={p.topLine} />

        {/* Logo */}
        <div style={p.logoArea}>
          <div style={p.logoMark}>N</div>
          <div style={p.title}>Welcome Back</div>
          <div style={p.subtitle}>// sign in to your account</div>
        </div>

        {/* Form */}
        <form style={p.form} onSubmit={handleSubmit}>
          <div style={p.field}>
            <label style={p.label}>Email Address</label>
            <input
              style={p.input}
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={focusIn}
              onBlur={focusOut}
              autoComplete="email"
            />
          </div>

          <div style={p.field}>
            <label style={p.label}>Password</label>
            <input
              style={p.input}
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              onFocus={focusIn}
              onBlur={focusOut}
              autoComplete="current-password"
            />
          </div>

          {error && <div style={p.error}>⚠ {error}</div>}

          <button
            style={{ ...p.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={p.demo}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Demo account:</span>
          {'  '}demo@neuralchat.ai{'  '}|{'  '}demo1234
        </div>

        <div style={p.footer}>
          No account?{' '}
          <Link to="/register" style={p.link}>Create one</Link>
        </div>
      </div>
    </div>
  );
}

const p = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-deep)',
    position: 'relative',
    overflow: 'hidden',
  },
  glow1: {
    position: 'absolute',
    width: '700px', height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 70%)',
    top: '-250px', right: '-200px',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)',
    bottom: '-200px', left: '-200px',
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
    backgroundSize: '64px 64px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow-card)',
  },
  topLine: {
    position: 'absolute',
    top: '-1px', left: '12%', right: '12%',
    height: '2px',
    background: 'linear-gradient(to right, transparent, var(--accent-cyan), var(--accent-violet), transparent)',
    borderRadius: '0 0 2px 2px',
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '36px',
  },
  logoMark: {
    width: '54px', height: '54px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
    boxShadow: 'var(--shadow-cyan)',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  input: {
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
  },
  error: {
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  btn: {
    padding: '13px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'linear-gradient(135deg, var(--accent-violet), #3730a3)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    marginTop: '4px',
    boxShadow: 'var(--shadow-violet)',
  },
  demo: {
    marginTop: '20px',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px dashed rgba(0,229,255,0.2)',
    background: 'rgba(0,229,255,0.03)',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  },
  link: {
    color: 'var(--accent-cyan)',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

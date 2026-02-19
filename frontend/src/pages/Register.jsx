import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../services/auth';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('All fields are required.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      registerUser(name, email, password);
      loginUser(email, password);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/chat'), 900);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const focusIn  = (e) => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; };
  const focusOut = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={p.page}>
      <div style={p.glow1} />
      <div style={p.glow2} />
      <div style={p.grid} />

      <div style={p.card}>
        <div style={p.topLine} />

        <div style={p.logoArea}>
          <div style={p.logoMark}>N</div>
          <div style={p.title}>Create Account</div>
          <div style={p.subtitle}>// join the knowledge network</div>
        </div>

        <form style={p.form} onSubmit={handleSubmit}>
          <div style={p.field}>
            <label style={p.label}>Full Name</label>
            <input style={p.input} type="text" value={name} placeholder="Ada Lovelace"
              onChange={(e) => setName(e.target.value)} onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div style={p.field}>
            <label style={p.label}>Email Address</label>
            <input style={p.input} type="email" value={email} placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)} onFocus={focusIn} onBlur={focusOut} autoComplete="email" />
          </div>

          <div style={p.field}>
            <label style={p.label}>Password</label>
            <input style={p.input} type="password" value={password} placeholder="Min. 6 characters"
              onChange={(e) => setPassword(e.target.value)} onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div style={p.field}>
            <label style={p.label}>Confirm Password</label>
            <input style={p.input} type="password" value={confirm} placeholder="••••••••"
              onChange={(e) => setConfirm(e.target.value)} onFocus={focusIn} onBlur={focusOut} />
          </div>

          {error   && <div style={p.error}>⚠ {error}</div>}
          {success && <div style={p.success}>✓ {success}</div>}

          <button
            style={{ ...p.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <div style={p.footer}>
          Already have an account?{' '}
          <Link to="/login" style={p.link}>Sign in</Link>
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
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,229,255,0.09) 0%, transparent 70%)',
    top: '-200px', left: '-200px', pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 70%)',
    bottom: '-200px', right: '-150px', pointerEvents: 'none',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
    backgroundSize: '64px 64px', pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '48px 40px',
    width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-card)',
  },
  topLine: {
    position: 'absolute', top: '-1px', left: '12%', right: '12%', height: '2px',
    background: 'linear-gradient(to right, transparent, var(--accent-violet), var(--accent-cyan), transparent)',
    borderRadius: '0 0 2px 2px',
  },
  logoArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px',
  },
  logoMark: {
    width: '54px', height: '54px', borderRadius: '16px',
    background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '800', color: '#fff',
    boxShadow: 'var(--shadow-violet)',
  },
  title: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)' },
  subtitle: { fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' },
  input: {
    padding: '11px 15px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'var(--bg-input)',
    color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-mono)',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
  },
  error: {
    padding: '10px 14px', borderRadius: 'var(--radius)',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', fontSize: '12px', fontFamily: 'var(--font-mono)',
  },
  success: {
    padding: '10px 14px', borderRadius: 'var(--radius)',
    background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.25)',
    color: 'var(--accent-cyan)', fontSize: '12px', fontFamily: 'var(--font-mono)',
  },
  btn: {
    padding: '13px', borderRadius: 'var(--radius)', border: 'none',
    background: 'linear-gradient(135deg, #0891b2, var(--accent-violet))',
    color: '#fff', fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-display)',
    cursor: 'pointer', marginTop: '4px', boxShadow: '0 4px 20px rgba(0,229,255,0.2)',
    transition: 'opacity 0.2s',
  },
  footer: { marginTop: '22px', textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' },
  link: { color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: '600' },
};

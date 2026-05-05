import { useState } from 'react';
import { loginUser, setSession, isValidEmail } from '../utils/auth.js';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function LoginForm({ onSuccess, onSwitchToSignup }) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) { setError('Please enter a valid email address.'); return; }
    if (!password)                   { setError('Password is required.'); return; }

    setLoading(true);
    try {
      const { token, user } = await loginUser(trimmedEmail, password);
      setSession(user.name, user.email, token);
      onSuccess?.({ name: user.name, email: user.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Welcome back</h2>
      <p className="form-sub">Log in to find your travel buddy</p>

      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPass} />
          </button>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn-primary btn-full" disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
      <p className="form-switch">
        Don&apos;t have an account?{' '}
        <a href="#" onClick={e => { e.preventDefault(); onSwitchToSignup?.(); }}>Sign Up</a>
      </p>
    </form>
  );
}

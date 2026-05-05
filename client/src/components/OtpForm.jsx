import { useState, useEffect } from 'react';
import { verifyOtp, setSession } from '../utils/auth.js';

const OTP_SECONDS = 10 * 60; // 10 minutes matches server expiry

export default function OtpForm({ email, onSuccess, onBack }) {
  const [code,      setCode]      = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(OTP_SECONDS);
  const [expired,   setExpired]   = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (expired)       { setError('Code has expired. Please go back and try again.'); return; }
    if (!code.trim())  { setError('Please enter the verification code.'); return; }

    setLoading(true);
    try {
      const { token, user } = await verifyOtp(email, code.trim());
      setSession(user.name, user.email, token);
      onSuccess({ name: user.name, email: user.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Check your email</h2>
      <p className="form-sub">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      <div className="form-group">
        <label htmlFor="otp-code">Verification Code</label>
        <input
          id="otp-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          disabled={expired}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          style={{ letterSpacing: '0.3em', fontSize: '1.4rem', textAlign: 'center' }}
        />
      </div>

      {/* Timer */}
      <p style={{
        textAlign: 'center',
        fontSize: '0.85rem',
        color: expired ? '#ef4444' : timeLeft <= 60 ? '#f97316' : '#888',
        margin: '0.25rem 0 0.75rem',
      }}>
        {expired
          ? 'Code expired — go back and request a new one'
          : `Code expires in ${formatTime(timeLeft)}`
        }
      </p>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" className="btn-primary btn-full" disabled={loading || expired}>
        {loading ? 'Verifying…' : 'Verify Email'}
      </button>

      <p className="form-switch">
        Wrong email?{' '}
        <a href="#" onClick={e => { e.preventDefault(); onBack?.(); }}>Go back</a>
      </p>
    </form>
  );
}

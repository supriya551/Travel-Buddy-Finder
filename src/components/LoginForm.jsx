import { useState } from 'react';
import { hashPassword, getUsers, setSession, isValidEmail } from '../utils/auth.js';

export default function LoginForm({ onSuccess, onSwitchToSignup }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) { setError('Please enter a valid email address.'); return; }
    if (!password)                   { setError('Password is required.'); return; }

    const users = getUsers();
    const user  = users.find((u) => u.email === trimmedEmail);
    if (!user)                                          { setError('No account found with this email.'); return; }
    if (user.passwordHash !== hashPassword(password))   { setError('Incorrect password.'); return; }

    setSession(user.name, user.email);
    onSuccess?.({ name: user.name, email: user.email });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Welcome back</h2>
      <p className="form-sub">Log in to find your travel buddy</p>
      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn-primary btn-full">Login</button>
      <p className="form-switch">
        Don&apos;t have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup?.(); }}>Sign Up</a>
      </p>
    </form>
  );
}

import { useState } from 'react';
import { hashPassword, getUsers, saveUsers, setSession, isValidEmail } from '../utils/auth.js';

export default function SignupForm({ onSuccess, onSwitchToLogin }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName)                { setError('Name is required.'); return; }
    if (!isValidEmail(trimmedEmail)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8)         { setError('Password must be at least 8 characters.'); return; }

    const users = getUsers();
    if (users.some((u) => u.email === trimmedEmail)) { setError('An account with this email already exists.'); return; }

    users.push({ name: trimmedName, email: trimmedEmail, passwordHash: hashPassword(password) });
    saveUsers(users);
    setSession(trimmedName, trimmedEmail);
    onSuccess?.({ name: trimmedName, email: trimmedEmail });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Create account</h2>
      <p className="form-sub">Start finding travel buddies today</p>
      <div className="form-group">
        <label htmlFor="signup-name">Full Name</label>
        <input id="signup-name" type="text" placeholder="Your name"
          value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" type="password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn-primary btn-full">Create Account</button>
      <p className="form-switch">
        Already have an account?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>Login</a>
      </p>
    </form>
  );
}

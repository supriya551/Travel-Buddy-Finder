const API = '/api/auth';

// ── API helpers ───────────────────────────────────────────────────────────────

async function request(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export function registerUser(name, email, password) {
  return request('/register', { name, email, password });
}

export function verifyOtp(email, code) {
  return request('/verify-otp', { email, code });
}

export function loginUser(email, password) {
  return request('/login', { email, password });
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function getSession() {
  try {
    const raw = sessionStorage.getItem('tb_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(name, email, token) {
  try {
    sessionStorage.setItem('tb_session', JSON.stringify({ name, email }));
    if (token) localStorage.setItem('tb_token', token);
  } catch {}
}

export function clearSession() {
  try {
    sessionStorage.removeItem('tb_session');
    localStorage.removeItem('tb_token');
  } catch {}
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function changePassword(currentPassword, newPassword) {
  const token = localStorage.getItem('tb_token');
  return fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  });
}

export function deleteAccount(password) {
  const token = localStorage.getItem('tb_token');
  return fetch('/api/auth/account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ password }),
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  });
}

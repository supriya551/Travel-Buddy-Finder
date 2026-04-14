export function hashPassword(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return String(hash);
}

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('tb_users') || '[]');
  } catch (_) {
    return [];
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem('tb_users', JSON.stringify(users));
  } catch (_) {}
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem('tb_session');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setSession(name, email) {
  try {
    sessionStorage.setItem('tb_session', JSON.stringify({ name, email }));
  } catch (_) {}
}

export function clearSession() {
  try {
    sessionStorage.removeItem('tb_session');
  } catch (_) {}
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

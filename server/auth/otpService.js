import AppError from './AppError.js';

// In-memory store: email → { code, expiresAt }
const store = new Map();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateAndStore(email) {
  const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return code;
}

export function verify(email, code) {
  const key   = email.toLowerCase();
  const entry = store.get(key);

  if (!entry) {
    throw new AppError('Invalid or expired verification code.', 400);
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    throw new AppError('Verification code has expired.', 400);
  }

  if (entry.code !== String(code).trim()) {
    throw new AppError('Incorrect verification code.', 400);
  }

  store.delete(key);
}

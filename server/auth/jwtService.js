import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRY  = '7d';

export function sign(payload) {
  if (!SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verify(token) {
  if (!SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.verify(token, SECRET);
}

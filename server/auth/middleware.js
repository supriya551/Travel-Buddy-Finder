import { verify } from './jwtService.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice(7);

  try {
    req.user = verify(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication required.' });
  }
}

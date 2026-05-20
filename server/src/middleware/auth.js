import { verifyToken } from '../auth.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function adminMiddleware(req, res, next) {
  if (!req.user?.role || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' });
  }
  next();
}

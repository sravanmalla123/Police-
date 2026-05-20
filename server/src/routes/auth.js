import express from 'express';
import bcrypt from 'bcryptjs';
import { get, all } from '../db.js';
import { signToken } from '../auth.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { loginId, password, role } = req.body;
  if (!loginId || !password) {
    return res.status(400).json({ message: 'Login ID and password are required.' });
  }

  try {
    const user = await get(`SELECT * FROM users WHERE employee_id = ?`, [loginId]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isAdminLogin = role === 'admin';
    if (isAdminLogin && !user.is_admin) {
      return res.status(403).json({ message: 'Admin credentials required.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken({ userId: user.id, role: user.is_admin ? 'admin' : user.role, name: user.name });

    return res.json({ token, user: { id: user.id, name: user.name, role: user.is_admin ? 'admin' : user.role } });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed due to server error.' });
  }
});

router.get('/officers', authMiddleware, async (req, res) => {
  try {
    const officers = await all(`SELECT id, employee_id, name, role FROM users WHERE is_admin = 0`);
    return res.json({ officers });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load officers.' });
  }
});

export default router;

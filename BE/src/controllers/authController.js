import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
  const { email, password, role_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      'INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)',
      [email, hash, role_id || 3]  // default role: customer
    );
    res.status(201).json({ id: r.insertId, email });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email đã tồn tại' });
    res.status(500).json({ error: e.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

  const token = jwt.sign(
    { id: user.id, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  res.json({ token });
}

export async function me(req, res) {
  const [rows] = await pool.query('SELECT id, email, role_id FROM users WHERE id = ?', [req.user.id]);
  res.json(rows[0]);
}

import { pool } from '../db.js';

export async function getAllUsers(req, res) {
  const [rows] = await pool.query('SELECT id, email, role_id FROM users');
  res.json(rows);
}

export async function getUser(req, res) {
  const [rows] = await pool.query('SELECT id, email, role_id FROM users WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy user' });
  res.json(rows[0]);
}

export async function deleteUser(req, res) {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.status(204).send();
}

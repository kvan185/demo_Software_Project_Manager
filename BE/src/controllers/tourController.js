import { pool } from '../db.js';

export async function getAllTours(req, res) {
  const [rows] = await pool.query('SELECT * FROM tours ORDER BY id DESC');
  res.json(rows);
}

export async function getTour(req, res) {
  const [rows] = await pool.query('SELECT * FROM tours WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Tour không tồn tại' });
  res.json(rows[0]);
}

export async function createTour(req, res) {
  const { code, title, short_description, price, duration_days, main_location_id } = req.body;
  const [r] = await pool.query(
    'INSERT INTO tours (code, title, short_description, price, duration_days, main_location_id, status) VALUES (?, ?, ?, ?, ?, ?, "draft")',
    [code, title, short_description, price, duration_days, main_location_id]
  );
  const [newTour] = await pool.query('SELECT * FROM tours WHERE id = ?', [r.insertId]);
  res.status(201).json(newTour[0]);
}

export async function updateTour(req, res) {
  const { title, price, status } = req.body;
  await pool.query('UPDATE tours SET title=?, price=?, status=? WHERE id=?',
    [title, price, status, req.params.id]);
  const [tour] = await pool.query('SELECT * FROM tours WHERE id=?', [req.params.id]);
  res.json(tour[0]);
}

export async function deleteTour(req, res) {
  await pool.query('DELETE FROM tours WHERE id = ?', [req.params.id]);
  res.status(204).send();
}

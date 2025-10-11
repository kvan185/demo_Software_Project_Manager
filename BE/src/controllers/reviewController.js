import { pool } from '../db.js';

export async function getReviews(req, res) {
  const [rows] = await pool.query('SELECT * FROM reviews ORDER BY id DESC');
  res.json(rows);
}

export async function addReview(req, res) {
  const { booking_id, customer_id, tour_id, guide_id, rating, comment } = req.body;
  const [r] = await pool.query(
    'INSERT INTO reviews (booking_id, customer_id, tour_id, guide_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
    [booking_id, customer_id, tour_id, guide_id, rating, comment]
  );
  const [review] = await pool.query('SELECT * FROM reviews WHERE id=?', [r.insertId]);
  res.status(201).json(review[0]);
}

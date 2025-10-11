import { pool } from '../db.js';

export async function createPayment(req, res) {
  const { booking_id, paid_by_user_id, amount, method } = req.body;
  const txRef = 'TXN-' + Date.now();
  try {
    const [r] = await pool.query(
      'INSERT INTO payments (booking_id, paid_by_user_id, amount, method, transaction_ref, status) VALUES (?, ?, ?, ?, ?, "success")',
      [booking_id, paid_by_user_id, amount, method, txRef]
    );
    res.status(201).json({ id: r.insertId, transaction_ref: txRef });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getPayments(req, res) {
  const [rows] = await pool.query('SELECT * FROM payments');
  res.json(rows);
}

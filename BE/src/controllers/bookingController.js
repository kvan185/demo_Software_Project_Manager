import { pool } from '../db.js';

export async function createBooking(req, res) {
  const { customer_id, schedule_id, qty_adults, qty_children, total_amount } = req.body;
  try {
    const booking_code = 'BK' + Date.now();
    const [r] = await pool.query(
      `INSERT INTO bookings (booking_code, customer_id, schedule_id, qty_adults, qty_children, total_amount, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
      [booking_code, customer_id, schedule_id, qty_adults, qty_children, total_amount]
    );
    const [b] = await pool.query('SELECT * FROM bookings WHERE id=?', [r.insertId]);
    res.status(201).json(b[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getBookings(req, res) {
  const [rows] = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
  res.json(rows);
}

export async function getBookingDetail(req, res) {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy booking' });
  res.json(rows[0]);
}

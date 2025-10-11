// routes/bookings.js
import express from 'express';
import { pool } from '../db.js';
import { authenticate } from '../middlewares/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Create booking (basic) — assumes customer_id provided (or derive from user)
router.post('/', authenticate, [
  body('customer_id').isInt(),
  body('schedule_id').optional().isInt(),
  body('custom_tour_id').optional().isInt(),
  body('qty_adults').isInt({min:0}),
  body('total_amount').isFloat({min:0})
], async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
  const { customer_id, schedule_id, custom_tour_id, qty_adults, qty_children, total_amount } = req.body;

  // basic check: only one of schedule_id/custom_tour_id
  if ((schedule_id && custom_tour_id) || (!schedule_id && !custom_tour_id)) {
    return res.status(400).json({error: 'Provide either schedule_id or custom_tour_id'});
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // create booking_code simple
    const booking_code = 'BK' + Date.now();

    const [ins] = await conn.query(
      `INSERT INTO bookings (booking_code, customer_id, schedule_id, custom_tour_id, qty_adults, qty_children, total_amount, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
      [booking_code, customer_id, schedule_id || null, custom_tour_id || null, qty_adults, qty_children || 0, total_amount]
    );

    // if schedule_id provided -> increment seats_booked (check capacity)
    if (schedule_id) {
      // check capacity
      const [sRows] = await conn.query('SELECT seats_total, seats_booked FROM tour_schedules WHERE id = ? FOR UPDATE', [schedule_id]);
      if (!sRows || sRows.length === 0) throw new Error('Schedule not found');
      const schedule = sRows[0];
      const newBooked = schedule.seats_booked + qty_adults + (qty_children || 0);
      if (newBooked > schedule.seats_total) throw new Error('Not enough seats');
      await conn.query('UPDATE tour_schedules SET seats_booked = ? WHERE id = ?', [newBooked, schedule_id]);
    }

    await conn.commit();
    const [bk] = await pool.query('SELECT * FROM bookings WHERE id = ?', [ins.insertId]);
    res.status(201).json(bk[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({error: err.message});
  } finally {
    conn.release();
  }
});

export default router;

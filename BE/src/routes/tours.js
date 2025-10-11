// routes/tours.js
import express from 'express';
import { pool } from '../db.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// GET /api/tours - list (pagination basic)
router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(100, Number(req.query.per_page) || 10);
  const offset = (page - 1) * perPage;
  const [rows] = await pool.query('SELECT id, code, title, price, duration_days, status FROM tours LIMIT ? OFFSET ?', [perPage, offset]);
  res.json({data: rows, page, perPage});
});

// GET /api/tours/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
  if (!rows || rows.length === 0) return res.status(404).json({error: 'Not found'});
  res.json(rows[0]);
});

// POST /api/tours (protected, e.g., admin/manager only)
router.post('/', authenticate, authorize([1 /* example role_id for admin */]), [
  body('title').notEmpty(),
  body('price').isNumeric()
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({errors: errs.array()});
  const { code, title, short_description, price, duration_days, main_location_id } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO tours (code, title, short_description, price, duration_days, main_location_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
      [code, title, short_description, price, duration_days, main_location_id]
    );
    const [row] = await pool.query('SELECT * FROM tours WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

// PUT /api/tours/:id (update)
router.put('/:id', authenticate, authorize([1]), async (req,res)=>{
  const id = req.params.id;
  // example: allow updating title and price
  const { title, price, status } = req.body;
  await pool.query('UPDATE tours SET title = COALESCE(?, title), price = COALESCE(?, price), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [title, price, status, id]);
  const [r] = await pool.query('SELECT * FROM tours WHERE id = ?', [id]);
  res.json(r[0]);
});

// DELETE /api/tours/:id
router.delete('/:id', authenticate, authorize([1]), async (req,res)=>{
  const id = req.params.id;
  await pool.query('DELETE FROM tours WHERE id = ?', [id]);
  res.status(204).send();
});

export default router;

import express from "express";
import { pool } from "../../db.js";
const router = express.Router();

// 🔹 Danh sách tour
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, l.name AS main_location 
      FROM tours t
      LEFT JOIN locations l ON t.main_location_id = l.id
      ORDER BY t.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm tour mới
router.post("/add-tour", async (req, res) => {
  const { code, title, short_description, price, duration_days, main_location_id } = req.body;
  if (!title || !price)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  try {
    const [result] = await pool.query(
      `INSERT INTO tours (code, title, short_description, price, duration_days, main_location_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
      [code || null, title, short_description || null, price, duration_days || 1, main_location_id || null]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể thêm tour" });
  }
});

// 🔹 Lấy chi tiết tour
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT t.*, l.name AS main_location
      FROM tours t
      LEFT JOIN locations l ON t.main_location_id = l.id
      WHERE t.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy tour" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - cập nhật tour
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { code, title, short_description, price, duration_days, main_location_id } = req.body;
  try {
    await pool.query(
      "UPDATE tours SET code=?, title=?, short_description=?, price=?, duration_days=?, main_location_id=? WHERE id=?",
      [code, title, short_description, price, duration_days, main_location_id, id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE - xóa tour
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tours WHERE id = ?", [id]);
    res.json({ message: "Đã xóa tour" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

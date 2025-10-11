import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy danh sách tất cả review
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
             c.full_name AS customer_name,
             t.title AS tour_title,
             e.full_name AS guide_name,
             b.booking_code
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN tours t ON r.tour_id = t.id
      LEFT JOIN employees e ON r.guide_id = e.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách review:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy review theo tour
router.get("/tour/:tour_id", async (req, res) => {
  const { tour_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.*, c.full_name AS customer_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.tour_id = ?
       ORDER BY r.created_at DESC`,
      [tour_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy review theo tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy review theo hướng dẫn viên
router.get("/guide/:guide_id", async (req, res) => {
  const { guide_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.*, c.full_name AS customer_name, t.title AS tour_title
       FROM reviews r
       JOIN customers c ON r.customer_id = c.id
       JOIN tours t ON r.tour_id = t.id
       WHERE r.guide_id = ?
       ORDER BY r.created_at DESC`,
      [guide_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy review theo hướng dẫn viên:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm review mới
router.post("/add-review", async (req, res) => {
  const { booking_id, customer_id, tour_id, guide_id, rating, comment } = req.body;
  if (!booking_id || !customer_id || !tour_id || !rating)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  try {
    const [result] = await pool.query(
      `INSERT INTO reviews 
       (booking_id, customer_id, tour_id, guide_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking_id, customer_id, tour_id, guide_id || null, rating, comment || null]
    );

    res.status(201).json({ id: result.insertId, message: "Đã thêm đánh giá" });
  } catch (err) {
    console.error("❌ Lỗi thêm review:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Khách đã đánh giá tour này rồi" });
    }
    res.status(500).json({ message: "Không thể thêm review", error: err.sqlMessage });
  }
});

// 🔹 Cập nhật review
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  try {
    await pool.query(
      `UPDATE reviews 
       SET rating=?, comment=?, updated_at=NOW()
       WHERE id=?`,
      [rating, comment, id]
    );
    res.json({ message: "Cập nhật đánh giá thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật review:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa review
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM reviews WHERE id=?", [id]);
    res.json({ message: "Đã xóa review" });
  } catch (err) {
    console.error("❌ Lỗi xóa review:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

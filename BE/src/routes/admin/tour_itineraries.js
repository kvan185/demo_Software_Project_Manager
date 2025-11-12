import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy tất cả lịch trình theo tour_id
router.get("/:tour_id", async (req, res) => {
  const { tour_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT ti.*, l.name AS location_name 
       FROM tour_itineraries ti
       LEFT JOIN locations l ON ti.location_id = l.id
       WHERE ti.tour_id = ? 
       ORDER BY ti.day_number ASC`,
      [tour_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy lịch trình tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy tất cả lịch trình (cho admin)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ti.*, t.title AS tour_title, l.name AS location_name
      FROM tour_itineraries ti
      JOIN tours t ON ti.tour_id = t.id
      LEFT JOIN locations l ON ti.location_id = l.id
      ORDER BY ti.tour_id, ti.day_number ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy tất cả lịch trình:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm lịch trình tour
router.post("/add-itinerary", async (req, res) => {
  const { tour_id, day_number, title, description, location_id } = req.body;
  if (!tour_id || !day_number || !title)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  try {
    const [result] = await pool.query(
      `INSERT INTO tour_itineraries
       (tour_id, day_number, title, description, location_id)
       VALUES (?, ?, ?, ?, ?)`,
      [tour_id, day_number, title, description || "", location_id || null]
    );
    res.status(201).json({ id: result.insertId, tour_id });
  } catch (err) {
    console.error("❌ Lỗi thêm lịch trình tour:", err);
    res.status(500).json({ message: "Không thể thêm lịch trình" });
  }
});

// 🔹 Cập nhật lịch trình tour
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { day_number, title, description, location_id } = req.body;
  try {
    await pool.query(
      `UPDATE tour_itineraries
       SET day_number=?, title=?, description=?, location_id=?
       WHERE id=?`,
      [day_number, title, description || "", location_id || null, id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật lịch trình tour:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa lịch trình tour
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tour_itineraries WHERE id = ?", [id]);
    res.json({ message: "Đã xóa lịch trình tour" });
  } catch (err) {
    console.error("❌ Lỗi xóa lịch trình tour:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

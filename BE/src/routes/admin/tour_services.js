import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy danh sách dịch vụ đi kèm của tất cả tour
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ts.id, ts.tour_id, t.title AS tour_title,
             ts.service_id, s.name AS service_name, s.type, 
             ts.qty, ts.note
      FROM tour_services ts
      JOIN tours t ON ts.tour_id = t.id
      JOIN services s ON ts.service_id = s.id
      ORDER BY ts.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách tour_services:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy danh sách dịch vụ của 1 tour cụ thể
router.get("/tour/:tour_id", async (req, res) => {
  const { tour_id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT ts.id, ts.service_id, s.name AS service_name, s.type, ts.qty, ts.note
      FROM tour_services ts
      JOIN services s ON ts.service_id = s.id
      WHERE ts.tour_id = ?
    `, [tour_id]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy dịch vụ của tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm dịch vụ vào tour
router.post("/add-tour-service", async (req, res) => {
  const { tour_id, service_id, qty, note } = req.body;
  if (!tour_id || !service_id) return res.status(400).json({ message: "Thiếu tour_id hoặc service_id" });

  try {
    const [result] = await pool.query(`
      INSERT INTO tour_services (tour_id, service_id, qty, note)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE qty = VALUES(qty), note = VALUES(note)
    `, [tour_id, service_id, qty || 1, note || null]);

    res.status(201).json({ id: result.insertId, tour_id, service_id });
  } catch (err) {
    console.error("❌ Lỗi thêm tour_service:", err);
    res.status(500).json({ message: "Không thể thêm dịch vụ cho tour" });
  }
});

// 🔹 Cập nhật dịch vụ tour
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { qty, note } = req.body;
  try {
    await pool.query("UPDATE tour_services SET qty=?, note=? WHERE id=?", [qty, note, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật tour_service:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa dịch vụ khỏi tour
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tour_services WHERE id=?", [id]);
    res.json({ message: "Đã xóa dịch vụ khỏi tour" });
  } catch (err) {
    console.error("❌ Lỗi xóa tour_service:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

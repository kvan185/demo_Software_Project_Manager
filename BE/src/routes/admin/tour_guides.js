import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy tất cả hướng dẫn viên đang được phân công
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tg.id, tg.schedule_id, t.title AS tour_title, tg.employee_id, e.full_name AS employee_name,
             tg.role, tg.assigned_at, ts.start_date, ts.end_date
      FROM tour_guides tg
      JOIN employees e ON tg.employee_id = e.id
      JOIN tour_schedules ts ON tg.schedule_id = ts.id
      JOIN tours t ON ts.tour_id = t.id
      ORDER BY tg.assigned_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách hướng dẫn viên tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy hướng dẫn viên theo lịch tour cụ thể
router.get("/schedule/:schedule_id", async (req, res) => {
  const { schedule_id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT tg.id, tg.employee_id, e.full_name AS employee_name, tg.role, tg.assigned_at
      FROM tour_guides tg
      JOIN employees e ON tg.employee_id = e.id
      WHERE tg.schedule_id = ?
    `, [schedule_id]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy hướng dẫn viên theo schedule:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm hướng dẫn viên vào lịch tour
router.post("/add-tour-guide", async (req, res) => {
  const { schedule_id, employee_id, role } = req.body;
  if (!schedule_id || !employee_id)
    return res.status(400).json({ message: "Thiếu schedule_id hoặc employee_id" });

  try {
    const [result] = await pool.query(`
      INSERT INTO tour_guides (schedule_id, employee_id, role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `, [schedule_id, employee_id, role || "guide"]);

    res.status(201).json({ id: result.insertId, schedule_id, employee_id });
  } catch (err) {
    console.error("❌ Lỗi thêm hướng dẫn viên:", err);
    res.status(500).json({ message: "Không thể thêm hướng dẫn viên cho tour" });
  }
});

// 🔹 Cập nhật vai trò của hướng dẫn viên
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await pool.query("UPDATE tour_guides SET role=? WHERE id=?", [role, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật tour_guide:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa hướng dẫn viên khỏi lịch tour
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tour_guides WHERE id=?", [id]);
    res.json({ message: "Đã xóa hướng dẫn viên khỏi tour" });
  } catch (err) {
    console.error("❌ Lỗi xóa hướng dẫn viên:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

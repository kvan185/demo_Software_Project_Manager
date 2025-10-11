import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy danh sách nhân viên
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.full_name, e.type, e.role_title, e.phone, e.status,
              e.created_at, e.updated_at,
              u.email AS user_email
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách nhân viên:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm nhân viên mới
router.post("/add-employee", async (req, res) => {
  const { user_id, full_name, type, role_title, phone, status } = req.body;
  if (!full_name) return res.status(400).json({ message: "Tên nhân viên là bắt buộc" });

  try {
    const [result] = await pool.query(
      `INSERT INTO employees (user_id, full_name, type, role_title, phone, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id || null, full_name, type || "other", role_title || null, phone || null, status || "active"]
    );
    res.status(201).json({ id: result.insertId, full_name });
  } catch (err) {
    console.error("❌ Lỗi thêm nhân viên:", err);
    res.status(500).json({ message: "Không thể thêm nhân viên" });
  }
});

// 🔹 Lấy chi tiết 1 nhân viên
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.email AS user_email 
       FROM employees e 
       LEFT JOIN users u ON e.user_id = u.id 
       WHERE e.id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi lấy nhân viên:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Cập nhật nhân viên
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, full_name, type, role_title, phone, status } = req.body;

  try {
    await pool.query(
      `UPDATE employees 
       SET user_id=?, full_name=?, type=?, role_title=?, phone=?, status=? 
       WHERE id=?`,
      [user_id || null, full_name, type, role_title, phone, status, id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật nhân viên:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa nhân viên
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM employees WHERE id = ?", [id]);
    res.json({ message: "Đã xóa nhân viên" });
  } catch (err) {
    console.error("❌ Lỗi xóa nhân viên:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

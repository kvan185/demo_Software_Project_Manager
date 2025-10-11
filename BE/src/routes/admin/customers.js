import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy danh sách khách hàng
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.full_name, c.phone, c.gender, c.birthday, 
              c.address, c.note, c.created_at, c.updated_at, 
              u.email AS user_email 
       FROM customers c
       LEFT JOIN users u ON c.user_id = u.id
       ORDER BY c.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách khách hàng:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm khách hàng mới
router.post("/add-customer", async (req, res) => {
  const { user_id, full_name, phone, birthday, gender, address, note } = req.body;
  if (!full_name) return res.status(400).json({ message: "Tên khách hàng là bắt buộc" });

  try {
    const [result] = await pool.query(
      `INSERT INTO customers (user_id, full_name, phone, birthday, gender, address, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, full_name, phone || null, birthday || null, gender || "other", address || null, note || null]
    );
    res.status(201).json({ id: result.insertId, full_name });
  } catch (err) {
    console.error("❌ Lỗi thêm khách hàng:", err);
    res.status(500).json({ message: "Không thể thêm khách hàng" });
  }
});

// 🔹 Lấy chi tiết khách hàng theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.email AS user_email
       FROM customers c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết khách hàng:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Cập nhật thông tin khách hàng
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, full_name, phone, birthday, gender, address, note } = req.body;

  try {
    await pool.query(
      `UPDATE customers 
       SET user_id=?, full_name=?, phone=?, birthday=?, gender=?, address=?, note=? 
       WHERE id=?`,
      [user_id || null, full_name, phone, birthday, gender, address, note, id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật khách hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa khách hàng
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM customers WHERE id = ?", [id]);
    res.json({ message: "Đã xóa khách hàng" });
  } catch (err) {
    console.error("❌ Lỗi xóa khách hàng:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

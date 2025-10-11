import express from "express";
import { pool } from "../../db.js";
const router = express.Router();

// 🔹 Danh sách dịch vụ
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM services ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm dịch vụ
router.post("/add-service", async (req, res) => {
  const { type, name, provider, details, price } = req.body;
  if (!name) return res.status(400).json({ message: "Thiếu tên dịch vụ" });
  try {
    const [result] = await pool.query(
      "INSERT INTO services (type, name, provider, details, price) VALUES (?, ?, ?, ?, ?)",
      [type || "other", name, provider || null, details || null, price || 0]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể thêm dịch vụ" });
  }
});

// 🔹 Chi tiết dịch vụ
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT - cập nhật dịch vụ
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { type, name, provider, details, price } = req.body;
  try {
    await pool.query(
      "UPDATE services SET type=?, name=?, provider=?, details=?, price=? WHERE id=?",
      [type, name, provider, details, price, id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE - xóa dịch vụ
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM services WHERE id = ?", [id]);
    res.json({ message: "Đã xóa dịch vụ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

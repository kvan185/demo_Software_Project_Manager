import express from "express";
import { pool } from "../../db.js";
const router = express.Router();

// 🔹 Lấy danh sách quyền
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM permissions ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy permissions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm quyền mới
router.post("/add-permission", async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Tên quyền là bắt buộc" });

  try {
    const [result] = await pool.query(
      "INSERT INTO permissions (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error("❌ Lỗi thêm permission:", err);
    res.status(500).json({ message: "Không thể thêm quyền" });
  }
});

// 🔹 Cập nhật quyền
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await pool.query("UPDATE permissions SET name=?, description=? WHERE id=?", [name, description, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật permission:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa quyền
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM permissions WHERE id=?", [id]);
    res.json({ message: "Đã xóa quyền" });
  } catch (err) {
    console.error("❌ Lỗi xóa permission:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

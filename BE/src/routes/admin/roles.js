import express from "express";
import { pool } from "../../db.js";
const router = express.Router();

// 🔹 Lấy danh sách vai trò
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM roles ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy roles:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm vai trò
router.post("/add-role", async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Tên vai trò là bắt buộc" });

  try {
    const [result] = await pool.query(
      "INSERT INTO roles (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error("❌ Lỗi thêm role:", err);
    res.status(500).json({ message: "Không thể thêm vai trò" });
  }
});

// 🔹 Cập nhật vai trò
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await pool.query("UPDATE roles SET name=?, description=? WHERE id=?", [name, description, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật role:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa vai trò
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM roles WHERE id=?", [id]);
    res.json({ message: "Đã xóa vai trò" });
  } catch (err) {
    console.error("❌ Lỗi xóa role:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Lấy quyền của 1 vai trò
router.get("/:id/permissions", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.description
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?`, [id]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy quyền theo role:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Gán quyền cho vai trò
router.post("/:id/permissions", async (req, res) => {
  const { id } = req.params;
  const { permission_ids } = req.body;
  if (!Array.isArray(permission_ids))
    return res.status(400).json({ message: "permission_ids phải là mảng" });

  try {
    await pool.query("DELETE FROM role_permissions WHERE role_id = ?", [id]);
    for (const pid of permission_ids) {
      await pool.query("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [id, pid]);
    }
    res.json({ message: "Cập nhật quyền cho vai trò thành công" });
  } catch (err) {
    console.error("❌ Lỗi gán quyền:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

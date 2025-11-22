import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy danh sách user
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
      users.*, 
      r.name AS role_name
      FROM users
      LEFT JOIN roles r ON users.role_id = r.id
      ORDER BY users.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm user mới
router.post("/add-user", async (req, res) => {
  const { email, password, role_id } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)",
      [email, hashed, role_id || null]
    );
    res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    console.error("❌ Lỗi thêm user:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    res.status(500).json({ message: "Không thể thêm user" });
  }
});

// 🔹 Lấy chi tiết 1 user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, email, role_id, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi lấy user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Cập nhật user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { email, password, role_id } = req.body;

  try {
    let query = "UPDATE users SET email = ?, role_id = ? WHERE id = ?";
    let params = [email, role_id, id];

    // Nếu có đổi mật khẩu
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query =
        "UPDATE users SET email = ?, password_hash = ?, role_id = ? WHERE id = ?";
      params = [email, hashed, role_id, id];
    }

    await pool.query(query, params);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Cấp lại mật khẩu mặc định = "123456"
router.put("/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const defaultPassword = newPassword || "123456";
    const hashed = await bcrypt.hash(defaultPassword, 10);

    // Cập nhật lại mật khẩu
    await pool.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [hashed, id]
    );

    res.json({ message: "Đã đặt lại mật khẩu mặc định " + defaultPassword });
  } catch (err) {
    console.error("❌ Lỗi khi reset mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "Đã xóa user" });
  } catch (err) {
    console.error("❌ Lỗi xóa user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

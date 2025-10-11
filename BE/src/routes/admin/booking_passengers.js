import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy toàn bộ danh sách hành khách
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bp.*, b.booking_code, c.full_name AS customer_name
      FROM booking_passengers bp
      JOIN bookings b ON bp.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      ORDER BY bp.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách hành khách:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy danh sách hành khách theo booking
router.get("/booking/:booking_id", async (req, res) => {
  const { booking_id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM booking_passengers WHERE booking_id = ? ORDER BY id DESC",
      [booking_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy hành khách theo booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm hành khách mới
router.post("/add-passenger", async (req, res) => {
  const { booking_id, full_name, gender, birth_date, passport_number, seat_type, price } = req.body;
  if (!booking_id || !full_name)
    return res.status(400).json({ message: "Thiếu booking_id hoặc tên hành khách" });

  try {
    const [result] = await pool.query(
      `INSERT INTO booking_passengers 
       (booking_id, full_name, gender, birth_date, passport_number, seat_type, price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [booking_id, full_name, gender || "other", birth_date || null, passport_number || null, seat_type || null, price || 0]
    );

    res.status(201).json({ id: result.insertId, booking_id, full_name });
  } catch (err) {
    console.error("❌ Lỗi thêm hành khách:", err);
    res.status(500).json({ message: "Không thể thêm hành khách" });
  }
});

// 🔹 Cập nhật thông tin hành khách
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { full_name, gender, birth_date, passport_number, seat_type, price } = req.body;
  try {
    await pool.query(
      `UPDATE booking_passengers 
       SET full_name=?, gender=?, birth_date=?, passport_number=?, seat_type=?, price=? 
       WHERE id=?`,
      [full_name, gender, birth_date, passport_number, seat_type, price, id]
    );
    res.json({ message: "Cập nhật hành khách thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật hành khách:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa hành khách
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM booking_passengers WHERE id=?", [id]);
    res.json({ message: "Đã xóa hành khách" });
  } catch (err) {
    console.error("❌ Lỗi xóa hành khách:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

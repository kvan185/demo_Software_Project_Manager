import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🧩 Hàm tạo mã đặt tour ngẫu nhiên
function generateBookingCode() {
  const prefix = "BK";
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
}

// 🔹 Lấy danh sách tất cả booking
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.booking_code, b.booking_date,
             c.full_name AS customer_name, c.phone,
             t.title AS tour_title,
             b.qty_adults, b.qty_children, b.total_amount,
             b.status, b.payment_status
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN tour_schedules ts ON b.schedule_id = ts.id
      LEFT JOIN tours t ON ts.tour_id = t.id
      ORDER BY b.booking_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy chi tiết booking theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT b.*, c.full_name AS customer_name, t.title AS tour_title
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN tour_schedules ts ON b.schedule_id = ts.id
      LEFT JOIN tours t ON ts.tour_id = t.id
      WHERE b.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy booking" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm booking mới
router.post("/add-booking", async (req, res) => {
  const {
    customer_id,
    schedule_id,
    custom_tour_id,
    qty_adults,
    qty_children,
    total_amount,
    note
  } = req.body;

  if (!customer_id || (!schedule_id && !custom_tour_id))
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  const bookingCode = generateBookingCode();

  try {
    const [result] = await pool.query(`
      INSERT INTO bookings 
      (booking_code, customer_id, schedule_id, custom_tour_id, qty_adults, qty_children, total_amount, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [bookingCode, customer_id, schedule_id || null, custom_tour_id || null, qty_adults || 1, qty_children || 0, total_amount || 0, note || null]);

    res.status(201).json({ id: result.insertId, booking_code: bookingCode });
  } catch (err) {
    console.error("❌ Lỗi thêm booking:", err);
    res.status(500).json({ message: "Không thể tạo booking" });
  }
});

// 🔹 Cập nhật booking
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { qty_adults, qty_children, total_amount, status, payment_status, note } = req.body;

  try {
    await pool.query(`
      UPDATE bookings 
      SET qty_adults=?, qty_children=?, total_amount=?, status=?, payment_status=?, note=?
      WHERE id=?`,
      [qty_adults, qty_children, total_amount, status, payment_status, note, id]
    );
    res.json({ message: "Cập nhật booking thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật booking:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa booking
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bookings WHERE id = ?", [id]);
    res.json({ message: "Đã xóa booking" });
  } catch (err) {
    console.error("❌ Lỗi xóa booking:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Hàm tạo mã hóa đơn tự động (INV20251011001)
function generateInvoiceNo() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0,10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV${dateStr}${random}`;
}

// 🔹 Lấy danh sách tất cả hóa đơn
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, b.booking_code, c.full_name AS customer_name
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      ORDER BY i.issued_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách hóa đơn:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy hóa đơn theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT i.*, b.booking_code, c.full_name AS customer_name
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN customers c ON b.customer_id = c.id
      WHERE i.id = ?
    `, [id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Lỗi lấy hóa đơn:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy hóa đơn theo booking
router.get("/booking/:booking_id", async (req, res) => {
  const { booking_id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM invoices WHERE booking_id = ?", [booking_id]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy hóa đơn theo booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm hóa đơn mới
router.post("/add-invoice", async (req, res) => {
  const { booking_id, amount, tax, status } = req.body;
  if (!booking_id || !amount)
    return res.status(400).json({ message: "Thiếu thông tin booking hoặc số tiền" });

  const invoiceNo = generateInvoiceNo();

  try {
    const [result] = await pool.query(`
      INSERT INTO invoices (booking_id, invoice_no, amount, tax, status)
      VALUES (?, ?, ?, ?, ?)
    `, [booking_id, invoiceNo, amount, tax || 0, status || "issued"]);

    res.status(201).json({ id: result.insertId, invoice_no: invoiceNo });
  } catch (err) {
    console.error("❌ Lỗi thêm hóa đơn:", err);
    res.status(500).json({ message: "Không thể tạo hóa đơn", error: err.sqlMessage || err.message });
  }
});

// 🔹 Cập nhật hóa đơn
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, tax, status } = req.body;
  try {
    await pool.query(
      `UPDATE invoices SET amount=?, tax=?, status=? WHERE id=?`,
      [amount, tax, status, id]
    );
    res.json({ message: "Cập nhật hóa đơn thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật hóa đơn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa hóa đơn
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM invoices WHERE id=?", [id]);
    res.json({ message: "Đã xóa hóa đơn" });
  } catch (err) {
    console.error("❌ Lỗi xóa hóa đơn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

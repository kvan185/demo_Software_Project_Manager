import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

/* =========================================================
   📌 1) API THỐNG KÊ — đặt đầu tiên để tránh conflict
========================================================= */
// 🔹 Thống kê doanh thu theo tháng (theo giờ VN, bỏ lệch ngày)
router.get("/stats/revenue", async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Missing month or year" });
    }

    // Lấy đầu và cuối tháng
    const startDate = `${year}-${month}-01 00:00:00`;
    const endDate = `${year}-${month}-31 23:59:59`;

    // Lấy tất cả invoices status = 'paid' trong tháng
    const sql = `
      SELECT issued_at, amount
      FROM invoices
      WHERE status = 'paid'
        AND issued_at BETWEEN ? AND ?
      ORDER BY issued_at ASC
    `;
    const [rows] = await pool.query(sql, [startDate, endDate]);

    // Nhóm theo ngày theo giờ VN (+7h)
    const revenueByDay = {};
    rows.forEach((row) => {
      const vnDate = new Date(row.issued_at);
      vnDate.setHours(vnDate.getHours() + 7); // Chuyển sang giờ VN
      const day = vnDate.toISOString().slice(0, 10); // YYYY-MM-DD
      revenueByDay[day] = (revenueByDay[day] || 0) + parseFloat(row.amount);
    });

    // Chuyển thành array
    const data = Object.keys(revenueByDay)
      .sort()
      .map((day) => ({
        day,
        revenue: revenueByDay[day].toFixed(2),
      }));

    res.json({
      month,
      year,
      data,
    });
  } catch (err) {
    console.error("🔥 Lỗi thống kê doanh thu:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   📌 2) Generate Invoice Number
========================================================= */
function generateInvoiceNo() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV${dateStr}${random}`;
}

/* =========================================================
   📌 3) Lấy danh sách hóa đơn theo user
========================================================= */
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [invoices] = await pool.query(
      `
      SELECT 
        i.id AS invoice_id,
        i.invoice_no,
        i.amount,
        i.tax,
        i.status AS invoice_status,
        i.issued_at AS invoice_date,
        
        b.id AS booking_id,
        b.booking_code,
        b.schedule_id,
        b.custom_tour_id,
        b.qty_adults,
        b.qty_children,
        b.total_amount,
        b.note,
        b.status AS booking_status,
        b.payment_status,
        b.booking_date,

        t.title,
        s.tour_id
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN tour_schedules s ON s.id = b.schedule_id
      JOIN tours t ON t.id = s.tour_id
      WHERE b.user_id = ?
      ORDER BY i.issued_at DESC
      `,
      [user_id]
    );

    for (let invoice of invoices) {
      const [passengers] = await pool.query(
        `
        SELECT id, full_name, gender, birth_date, passport_number, seat_type, price
        FROM booking_passengers
        WHERE booking_id = ?
        `,
        [invoice.booking_id]
      );
      invoice.passengers = passengers;
    }

    res.json(invoices);
  } catch (err) {
    console.error("❌ Lỗi lấy hóa đơn theo user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================================================
   📌 4) Lấy hóa đơn theo booking_id
   ⚠️ Đặt TRƯỚC route /:id để tránh conflict!
========================================================= */
router.get("/booking/:booking_id", async (req, res) => {
  const { booking_id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM invoices WHERE booking_id = ?",
      [booking_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy hóa đơn theo booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   📌 5) Lấy hóa đơn theo ID (cuối cùng trong nhóm GET)
========================================================= */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        i.id AS invoice_id,
        i.invoice_no,
        i.amount,
        i.tax,
        i.status AS invoice_status,
        i.issued_at AS invoice_date,

        b.id AS booking_id,
        b.booking_code,
        b.schedule_id,
        b.custom_tour_id,
        b.qty_adults,
        b.qty_children,
        b.total_amount,
        b.note,
        b.status AS booking_status,
        b.payment_status,
        b.booking_date,

        u.id AS user_id,
        u.email
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN users u ON u.id = b.user_id
      WHERE i.id = ?
      `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    const invoice = rows[0];

    const [passengers] = await pool.query(
      `
      SELECT id, full_name, gender, birth_date, passport_number, seat_type, price
      FROM booking_passengers
      WHERE booking_id = ?
      `,
      [invoice.booking_id]
    );

    invoice.passengers = passengers;

    res.json(invoice);
  } catch (err) {
    console.error("❌ Lỗi lấy hóa đơn:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   📌 6) Lấy tất cả hóa đơn
========================================================= */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, b.booking_code, b.user_id, u.email AS customer_name
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY i.issued_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách hóa đơn:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   📌 7) Thêm hóa đơn
========================================================= */
router.post("/add-invoice", async (req, res) => {
  const { booking_id, amount, tax, status } = req.body;

  if (!booking_id || !amount)
    return res
      .status(400)
      .json({ message: "Thiếu thông tin booking hoặc số tiền" });

  const invoiceNo = generateInvoiceNo();

  try {
    const [result] = await pool.query(
      `
      INSERT INTO invoices (booking_id, invoice_no, amount, tax, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [booking_id, invoiceNo, amount, tax || 0, status || "issued"]
    );

    res.status(201).json({ id: result.insertId, invoice_no: invoiceNo });
  } catch (err) {
    console.error("❌ Lỗi thêm hóa đơn:", err);
    res
      .status(500)
      .json({ message: "Không thể tạo hóa đơn", error: err.sqlMessage });
  }
});

/* =========================================================
   📌 8) Cập nhật hóa đơn
========================================================= */
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

/* =========================================================
   📌 9) Xóa hóa đơn
========================================================= */
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

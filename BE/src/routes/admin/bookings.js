import express from "express";
import { pool } from "../../db.js";
import axios from "axios";
import crypto from "crypto";

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
    const [rows] = await pool.query(
      `
      SELECT b.*, c.full_name AS customer_name, t.title AS tour_title
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN tour_schedules ts ON b.schedule_id = ts.id
      LEFT JOIN tours t ON ts.tour_id = t.id
      WHERE b.id = ?
    `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy booking" });
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
    note,
  } = req.body;

  if (!customer_id || (!schedule_id && !custom_tour_id))
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  const bookingCode = generateBookingCode();

  try {
    const [result] = await pool.query(
      `
      INSERT INTO bookings 
      (booking_code, customer_id, schedule_id, custom_tour_id, qty_adults, qty_children, total_amount, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        bookingCode,
        customer_id,
        schedule_id || null,
        custom_tour_id || null,
        qty_adults || 1,
        qty_children || 0,
        total_amount || 0,
        note || null,
      ]
    );

    res.status(201).json({ id: result.insertId, booking_code: bookingCode });
  } catch (err) {
    console.error("❌ Lỗi thêm booking:", err);
    res.status(500).json({ message: "Không thể tạo booking" });
  }
});

// 🔹 Cập nhật booking
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    qty_adults,
    qty_children,
    total_amount,
    status,
    payment_status,
    note,
  } = req.body;

  try {
    await pool.query(
      `
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

// đặt tour
// Tạo mã invoice
function generateInvoiceNo() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV${dateStr}${random}`;
}

// ================================================
// 🔥 API đặt tour đầy đủ (booking + passengers + invoice)
// ================================================
// ==================== CREATE BOOKING & MoMo PAYMENT ====================
router.post("/create-full", async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const {
      customer_id,
      schedule_id,
      custom_tour_id,
      qty_adults,
      qty_children,
      total_amount,
      note,
      passengers,
    } = req.body;

    if (!customer_id || (!schedule_id && !custom_tour_id)) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // 1️⃣ Tạo booking
    const bookingCode = generateBookingCode();
    const [bookingRes] = await conn.query(
      `INSERT INTO bookings 
        (booking_code, customer_id, schedule_id, custom_tour_id, qty_adults, qty_children, total_amount, note, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingCode,
        customer_id,
        schedule_id || null,
        custom_tour_id || null,
        qty_adults || 1,
        qty_children || 0,
        total_amount || 0,
        note || null,
        "PENDING",
      ]
    );
    const bookingId = bookingRes.insertId;

    // 2️⃣ Thêm hành khách
    if (passengers && passengers.length > 0) {
      for (const p of passengers) {
        await conn.query(
          `INSERT INTO booking_passengers 
            (booking_id, full_name, gender, birth_date, passport_number, seat_type, price)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingId,
            p.full_name,
            p.gender || "other",
            p.birth_date || null,
            p.passport_number || null,
            p.seat_type || null,
            p.price || 0,
          ]
        );
      }
    }

    // 3️⃣ Tạo hóa đơn
    const invoiceNo = generateInvoiceNo();
    await conn.query(
      `INSERT INTO invoices (booking_id, invoice_no, amount, tax, status)
       VALUES (?, ?, ?, ?, ?)`,
      [bookingId, invoiceNo, total_amount, 0, "issued"]
    );

    // 4️⃣ Tạo request MoMo
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const requestId = partnerCode + new Date().getTime();
    const orderId = bookingCode;
    const orderInfo = `Thanh toán booking ${bookingCode}`;
    const redirectUrl = "http://localhost:5173";
    const ipnUrl =
      "https://margret-administrant-unsucculently.ngrok-free.dev/api/admin/bookings/momo-ipn";
    const amount = total_amount.toString();
    const requestType = "captureWallet";
    const extraData = "";
    const paymentCode =
      "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
    var orderGroupId = "";
    var autoCapture = true;
    var lang = "vi";
    // Tạo signature
    var rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "en",
    };

    const momoRes = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );

    await conn.commit();
    conn.release();

    return res.status(201).json({
      message: "Booking created, redirect to MoMo",
      booking_id: bookingId,
      booking_code: bookingCode,
      invoice_no: invoiceNo,
      payUrl: momoRes.data.payUrl,
    });
  } catch (err) {
    console.error("❌ Lỗi transaction:", err);
    await conn.rollback();
    conn.release();
    return res
      .status(500)
      .json({ message: "Không thể tạo booking", error: err.message });
  }
});

// ==================== IPN FROM MOMO ====================
// POST /api/admin/bookings/momo-ipn
router.post("/momo-ipn", async (req, res) => {
  try {
    const {
      partnerCode,
      accessKey,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"; // MoMo secretKey

    // 🔹 Xây dựng rawSignature chính xác theo tài liệu MoMo IPN
    const rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&orderType=" +
      orderType +
      "&partnerCode=" +
      partnerCode +
      "&transId=" +
      transId +
      "&resultCode=" +
      resultCode;

    // 🔹 Tạo hash
    const checkSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // if (checkSignature !== signature) {
    //   console.error("❌ Invalid signature");
    //   return res.status(400).json({ message: "Invalid signature" });
    // }

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Lấy booking info
      const [bookingRows] = await conn.query(
        "SELECT id, schedule_id, qty_adults, qty_children FROM bookings WHERE booking_code = ?",
        [orderId]
      );

      if (bookingRows.length === 0) {
        throw new Error(`Booking ${orderId} not found`);
      }

      const booking = bookingRows[0];
      const totalPassengers = booking.qty_adults + booking.qty_children;

      if (resultCode === 0) {
        // Thanh toán thành công
        await conn.query(
          "UPDATE bookings SET status = ? WHERE booking_code = ?",
          ["completed", orderId]
        );
        await conn.query(
          "UPDATE invoices SET status = ? WHERE booking_id = ?",
          ["PAID", booking.id]
        );

        // Cập nhật số ghế đã đặt
        if (booking.schedule_id) {
          await conn.query(
            "UPDATE tour_schedules SET seats_booked = seats_booked + ? WHERE id = ?",
            [totalPassengers, booking.schedule_id]
          );
        }

        console.log(`✅ Booking ${orderId} updated to PAID`);
      } else {
        // Thanh toán thất bại
        await conn.query(
          "UPDATE bookings SET status = ? WHERE booking_code = ?",
          ["cancelled", orderId]
        );
        await conn.query(
          "UPDATE invoices SET status = ? WHERE booking_id = ?",
          ["FAILED", booking.id]
        );
        console.log(`❌ Booking ${orderId} updated to FAILED`);
      }

      await conn.commit();
      conn.release();
      return res.status(200).json({ message: "IPN processed" });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error("IPN error:", err);
    return res.status(500).json({ message: "IPN error", error: err.message });
  }
});

export default router;

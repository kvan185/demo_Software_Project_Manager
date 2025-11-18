import { pool } from "../../db.js";
import express from "express";

router.get("/vnpay_return", async (req, res) => {
  const vnp_Params = req.query;

  const bookingId = vnp_Params["vnp_TxnRef"];
  const responseCode = vnp_Params["vnp_ResponseCode"];

  const conn = await pool.getConnection();

  try {
    if (responseCode === "00") {
      // ✔ Thanh toán thành công
      await conn.query(`UPDATE bookings SET status='paid' WHERE booking_id=?`, [
        bookingId,
      ]);
      await conn.query(`UPDATE invoices SET status='paid' WHERE booking_id=?`, [
        bookingId,
      ]);
    } else {
      // ❌ Thanh toán thất bại
      await conn.query(
        `UPDATE bookings SET status='failed' WHERE booking_id=?`,
        [bookingId]
      );
      await conn.query(
        `UPDATE invoices SET status='failed' WHERE booking_id=?`,
        [bookingId]
      );
    }

    return res.redirect(
      `http://localhost:3000/payment-result?code=${responseCode}`
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  } finally {
    conn.release();
  }
});

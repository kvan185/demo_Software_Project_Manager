import express from "express";
import { pool } from "../../db.js";
const router = express.Router();

// 🔹 Lấy danh sách lịch tour theo userId (chỉ những tour chưa kết thúc)
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Lấy danh sách booking của user
    const [bookings] = await pool.query(
      "SELECT id AS booking_id, booking_code, schedule_id FROM bookings WHERE user_id = ?",
      [userId]
    );

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "Người dùng chưa có booking nào" });
    }

    // 2️⃣ Lấy danh sách schedule_id từ các booking
    const scheduleIds = bookings.map((b) => b.schedule_id);

    if (!scheduleIds.length) {
      return res.json([]);
    }

    // 3️⃣ Lấy thông tin tour_schedule dựa trên schedule_id và end_date >= NOW()
    const [schedules] = await pool.query(
      `SELECT ts.* , t.title as tour_name 
       FROM tour_schedules ts
       JOIN tours t ON t.id = ts.tour_id 
       WHERE ts.end_date >= NOW() 
       AND ts.id IN (${scheduleIds.map(() => "?").join(",")})`,
      scheduleIds
    );

    // 4️⃣ Kết hợp booking và schedule
    const result = bookings
      .map((b) => {
        const schedule = schedules.find((s) => s.id === b.schedule_id);
        if (!schedule) return null;
        return {
          booking_id: b.booking_id,
          booking_code: b.booking_code,
          schedule: schedule || null,
        };
      })
      .filter((b) => b !== null);
    res.json(result);
  } catch (err) {
    console.error("❌ Lỗi lấy tour_schedule theo user_id:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/get_schedule_by_id/:id", async (req, res) => {
  const { id } = req.params;
  console.log(">>> id: ", id);
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tour_schedules WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy lịch trình" });
    }
    res.json(rows[0]); // trả về object thay vì mảng
  } catch (err) {
    console.error("❌ Lỗi lấy lịch trình tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// 🔹 Lấy danh sách lịch tour theo id tour
router.get("/:tour_id", async (req, res) => {
  const { tour_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM tour_schedules WHERE tour_id = ? ORDER BY start_date DESC`,
      [tour_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy lịch trình tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy danh sách lịch tour
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ts.*, t.title AS tour_title
      FROM tour_schedules ts
      JOIN tours t ON ts.tour_id = t.id
      ORDER BY ts.start_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy lịch tour:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm lịch tour
router.post("/add-schedule", async (req, res) => {
  const {
    tour_id,
    start_date,
    end_date,
    seats_total,
    seats_booked,
    price_per_person,
    status,
  } = req.body;
  if (!tour_id || !start_date || !end_date || !seats_total)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  try {
    const [result] = await pool.query(
      `INSERT INTO tour_schedules 
       (tour_id, start_date, end_date, seats_total, seats_booked, price_per_person, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tour_id,
        start_date,
        end_date,
        seats_total,
        seats_booked || 0,
        price_per_person || null,
        status || "open",
      ]
    );
    res.status(201).json({ id: result.insertId, tour_id });
  } catch (err) {
    console.error("❌ Lỗi thêm lịch tour:", err);
    res.status(500).json({ message: "Không thể thêm lịch tour" });
  }
});

// 🔹 Cập nhật lịch tour
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    start_date,
    end_date,
    seats_total,
    seats_booked,
    price_per_person,
    status,
  } = req.body;
  try {
    await pool.query(
      `UPDATE tour_schedules 
       SET start_date=?, end_date=?, seats_total=?, seats_booked=?, price_per_person=?, status=? 
       WHERE id=?`,
      [
        start_date,
        end_date,
        seats_total,
        seats_booked,
        price_per_person,
        status,
        id,
      ]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ Lỗi cập nhật lịch tour:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa lịch tour
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tour_schedules WHERE id = ?", [id]);
    res.json({ message: "Đã xóa lịch tour" });
  } catch (err) {
    console.error("❌ Lỗi xóa lịch tour:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

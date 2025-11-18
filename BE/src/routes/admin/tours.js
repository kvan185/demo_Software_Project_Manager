import express from "express";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import { pool } from "../../db.js";

const router = express.Router();

// Thư mục lưu ảnh
const ASSET_DIR = path.join(
  process.cwd(),
  "front-end/public/assets/tour_images"
);
if (!fs.existsSync(ASSET_DIR)) fs.mkdirSync(ASSET_DIR, { recursive: true });

// 🔹 Lấy danh sách tours
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Lấy tất cả tour + location
    const [tours] = await pool.query(`
    SELECT 
    t.*, 
    l_main.name AS main_location,
    ti.location_id as destination_id
    FROM tours t
    LEFT JOIN locations l_main ON t.main_location_id = l_main.id
    LEFT JOIN tour_itineraries ti ON t.id = ti.tour_id AND day_number = 1
    LEFT JOIN locations l_it ON ti.location_id = l_it.id
    GROUP BY t.id
    ORDER BY t.id DESC;
    `);

    // 2️⃣ Lấy tất cả ảnh của các tour
    const tourIds = tours.map((t) => t.id);
    const [images] = await pool.query(
      `
      SELECT tour_id, img
      FROM tour_images
      WHERE tour_id IN (?)
    `,
      [tourIds]
    );

    const [start_dates] = await pool.query(
      `
      SELECT tour_id, start_date
      FROM tour_schedules
      WHERE tour_id IN (?)
    `,
      [tourIds]
    );

    // 3️⃣ Gom ảnh vào từng tour
    const toursWithImages = tours.map((t) => {
      return {
        ...t,
        img: images.filter((i) => i.tour_id === t.id).map((i) => i.img),
        start_dates: start_dates
          .filter((s) => s.tour_id === t.id && s.start_date >= new Date())
          .map((s) => s.start_date),
      };
    });

    res.json(toursWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Lấy danh sách ảnh của tour
router.get("/:id/images", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tour_images WHERE tour_id=?",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm tour + upload ảnh
router.post("/", async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: "Lỗi upload file" });

    const {
      code,
      title,
      short_description,
      price,
      duration_days,
      main_location_id,
      min_participants,
      max_participants,
    } = fields;

    if (!title || !price)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    try {
      // 1️⃣ Thêm tour
      const [result] = await pool.query(
        `INSERT INTO tours 
         (code, title, short_description, price, duration_days, main_location_id, min_participants, max_participants, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [
          code || null,
          title,
          short_description || null,
          price,
          duration_days || 1,
          main_location_id || null,
          min_participants || 1,
          max_participants || 1,
        ]
      );
      const tourId = result.insertId;

      // 2️⃣ Upload ảnh → copy vào assets + lưu URL vào DB
      const uploadedFiles = files.images
        ? Array.isArray(files.images)
          ? files.images
          : [files.images]
        : [];

      for (let f of uploadedFiles) {
        const ext = path.extname(f.originalFilename);
        const fileName =
          Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
        const destPath = path.join(ASSET_DIR, fileName);
        fs.copyFileSync(f.filepath, destPath);

        const imgUrl = `/assets/tour_images/${fileName}`;
        await pool.query(
          "INSERT INTO tour_images (tour_id, img) VALUES (?, ?)",
          [tourId, imgUrl]
        );
      }

      res.status(201).json({ id: tourId, title });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Không thể thêm tour" });
    }
  });
});

// 🔹 Sửa tour + upload ảnh mới
router.put("/:id", async (req, res) => {
  const tourId = req.params.id;
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: "Lỗi upload file" });

    const {
      code,
      title,
      short_description,
      price,
      duration_days,
      main_location_id,
      min_participants,
      max_participants,
    } = fields;

    if (!title || !price)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    try {
      // 1️⃣ Cập nhật tour
      await pool.query(
        `UPDATE tours SET 
         code=?, title=?, short_description=?, price=?, duration_days=?, main_location_id=?, min_participants=?, max_participants=? 
         WHERE id=?`,
        [
          code || null,
          title,
          short_description || null,
          price,
          duration_days || 1,
          main_location_id || null,
          min_participants || 1,
          max_participants || 1,
          tourId,
        ]
      );

      // 2️⃣ Upload ảnh mới nếu có → copy vào assets + thêm vào DB
      const uploadedFiles = files.images
        ? Array.isArray(files.images)
          ? files.images
          : [files.images]
        : [];

      for (let f of uploadedFiles) {
        const ext = path.extname(f.originalFilename);
        const fileName =
          Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
        const destPath = path.join(ASSET_DIR, fileName);
        fs.copyFileSync(f.filepath, destPath);

        const imgUrl = `/assets/tour_images/${fileName}`;
        await pool.query(
          "INSERT INTO tour_images (tour_id, img) VALUES (?, ?)",
          [tourId, imgUrl]
        );
      }

      res.json({ message: "Cập nhật thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
});

// 🔹 Xóa tour + ảnh (tour_images ON DELETE CASCADE)
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM tours WHERE id=?", [req.params.id]);
    res.json({ message: "Đã xóa tour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 🔹 Xóa ảnh riêng
router.delete("/images/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tour_images WHERE id=?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy ảnh" });

    const imgPath = path.join(process.cwd(), "frontend/public", rows[0].img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await pool.query("DELETE FROM tour_images WHERE id=?", [req.params.id]);
    res.json({ message: "Đã xóa ảnh" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// 🔹 Lấy 3 tour bất kỳ (khác tour hiện tại)
router.get("/:id/other-tours", async (req, res) => {
  const tourId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT t.*, l.name AS main_location
       FROM tours t
       LEFT JOIN locations l ON t.main_location_id = l.id
       WHERE t.id != ?
       ORDER BY RAND()   -- chọn ngẫu nhiên
       LIMIT 3`, // chỉ lấy 3 tour
      [tourId]
    );

    // Lấy ảnh cho từng tour
    const tourIds = rows.map((t) => t.id);
    const [images] = await pool.query(
      `SELECT tour_id, img FROM tour_images WHERE tour_id IN (?)`,
      [tourIds]
    );

    const toursWithImages = rows.map((t) => ({
      ...t,
      img: images.filter((i) => i.tour_id === t.id).map((i) => i.img),
    }));

    res.json(toursWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
export default router;

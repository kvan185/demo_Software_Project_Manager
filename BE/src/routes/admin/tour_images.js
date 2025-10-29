import express from "express";
import { pool } from "../../db.js";

const router = express.Router();

// 🔹 Lấy tất cả ảnh của 1 tour
router.get("/:tour_id", async (req, res) => {
  const { tour_id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tour_images WHERE tour_id=?",
      [tour_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Thêm ảnh mới cho tour
router.post("/", async (req, res) => {
  const { tour_id, img } = req.body;
  if (!tour_id || !img)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  try {
    const [result] = await pool.query(
      "INSERT INTO tour_images (tour_id, img) VALUES (?, ?)",
      [tour_id, img]
    );
    res.status(201).json({ id: result.insertId, tour_id, img });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể thêm ảnh" });
  }
});

// 🔹 Xóa ảnh
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tour_images WHERE id=?", [id]);
    res.json({ message: "Đã xóa ảnh" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;

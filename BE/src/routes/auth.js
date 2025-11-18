import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
const router = express.Router();

// Register (basic): create user with role_id optional
router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password, role_id, name, phone, birthday, gender, address } =
      req.body;
    const conn = await pool.getConnection(); // lấy connection để dùng transaction

    try {
      await conn.beginTransaction(); // bắt đầu transaction

      const hashed = await bcrypt.hash(password, 10);
      // insert user
      const [resInsertUser] = await conn.query(
        `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
        [email, hashed, role_id || 2]
      );

      const userId = resInsertUser.insertId;

      // insert vào bảng cus
      await conn.query(
        `INSERT INTO customers (user_id, full_name, phone, birthday, gender, address) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name, phone, birthday, gender, address]
      );

      await conn.commit(); // commit nếu cả 2 insert thành công
      res.status(201).json(true);
    } catch (err) {
      await conn.rollback(); // rollback nếu có lỗi
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Email already exists" });
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    } finally {
      conn.release(); // giải phóng connection
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      `SELECT u.id, u.password_hash, u.role_id,
       c.id AS customer_id
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id
      WHERE u.email = ?`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Không tìm thấy email" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Mật khẩu không đúng" });

    // Lấy customer_id từ user
    const payload = {
      id: user.id,
      cus_id: user.customer_id,
      role_id: user.role_id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    console.log(">>> token payload: ", token);
    res.json({ token });
  }
);

export default router;

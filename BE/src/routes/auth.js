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

    const { email, password, role_id } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const [resInsert] = await pool.query(
        `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
        [email, hashed, role_id || null]
      );
      return res.status(201).json({ id: resInsert.insertId, email });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Email already exists" });
      console.error(err);
      return res.status(500).json({ message: "Server error" });
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
      `SELECT id, password_hash, role_id FROM users WHERE email = ?`,
      [email]
    );
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "ko co email?" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "ko co password?" });

    const payload = { id: user.id, role_id: user.role_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
    res.json({ token });
  }
);

export default router;

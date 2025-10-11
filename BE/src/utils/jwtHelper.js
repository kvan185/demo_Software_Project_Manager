// src/utils/jwtHelper.js
import jwt from 'jsonwebtoken';

export function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '1d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

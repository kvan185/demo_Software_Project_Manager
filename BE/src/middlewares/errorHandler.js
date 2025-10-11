// src/middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error('🔥 Lỗi hệ thống:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi máy chủ',
  });
}

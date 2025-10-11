// src/utils/response.js
export function successResponse(res, data = {}, message = 'Thành công') {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

export function createdResponse(res, data = {}, message = 'Tạo mới thành công') {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res, message = 'Lỗi hệ thống', status = 500) {
  return res.status(status).json({
    success: false,
    message,
  });
}

export function notFound(res, message = 'Không tìm thấy') {
  return res.status(404).json({
    success: false,
    message,
  });
}

export function unauthorized(res, message = 'Không có quyền truy cập') {
  return res.status(401).json({
    success: false,
    message,
  });
}

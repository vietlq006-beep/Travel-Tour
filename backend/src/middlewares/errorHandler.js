const multer = require('multer');
const ApiResponse = require('../utils/apiResponse');

const normalizeError = (err) => {
  if (err.name === 'SequelizeValidationError') {
    return [422, 'Dữ liệu không hợp lệ', err.errors.map((item) => ({ field: item.path, message: item.message }))];
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return [409, 'Dữ liệu đã tồn tại trong hệ thống', err.errors.map((item) => ({ field: item.path, message: `${item.path} đã được sử dụng` }))];
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return [409, 'Không thể thực hiện vì dữ liệu đang được tham chiếu', []];
  }
  if (err.name === 'JsonWebTokenError') return [401, 'Token xác thực không hợp lệ.', []];
  if (err.name === 'TokenExpiredError') return [401, 'Phiên đăng nhập đã hết hạn.', []];
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return [413, 'Ảnh tải lên vượt quá giới hạn 5 MB.', []];
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return [400, 'Nội dung JSON không hợp lệ.', []];
  }
  if (err.isOperational) return [err.statusCode || 500, err.message, err.errors || []];
  return [500, 'Lỗi máy chủ nội bộ', []];
};

const errorHandler = (err, req, res, _next) => {
  const [statusCode, message, errors] = normalizeError(err);
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Global Error]', {
      requestId: req.requestId, name: err.name, message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
  res.setHeader('X-Request-Id', req.requestId || 'unknown');
  return ApiResponse.error(res, message, errors, statusCode);
};

module.exports = errorHandler;

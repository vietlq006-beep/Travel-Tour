const ApiResponse = require('../utils/apiResponse');

/**
 * Global Error Handler Middleware
 * Bắt mọi ngoại lệ chưa được xử lý trong ứng dụng
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)';
  let errors = err.errors || [];

  // Lỗi xác thực của Sequelize (Validation error)
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Dữ liệu không hợp lệ';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Lỗi vi phạm ràng buộc duy nhất (Unique constraint)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại trong hệ thống';
    errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} đã được sử dụng`
    }));
  }

  // Lỗi JWT token sai
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token xác thực không hợp lệ. Vui lòng đăng nhập lại.';
  }

  // Lỗi JWT token hết hạn
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  // Log chi tiết lỗi nếu ở môi trường development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 [Global Error]', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }

  return ApiResponse.error(res, message, errors, statusCode);
};

module.exports = errorHandler;

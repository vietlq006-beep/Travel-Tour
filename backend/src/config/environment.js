const AppError = require('../utils/appError');

const validateEnvironment = () => {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new AppError(`Thiếu biến môi trường: ${missing.join(', ')}`, 500);
  if (process.env.JWT_SECRET.length < 32) throw new AppError('JWT_SECRET phải có ít nhất 32 ký tự.', 500);
  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ADMIN_URL && !process.env.CLIENT_CUSTOMER_URL) {
    throw new AppError('Production cần cấu hình ít nhất một CLIENT URL.', 500);
  }
};

module.exports = { validateEnvironment };

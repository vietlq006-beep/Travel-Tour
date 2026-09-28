const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');

/**
 * Middleware xác thực Access Token (JWT)
 */
const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    // Lấy token từ header Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Bạn chưa đăng nhập. Vui lòng cung cấp Access Token.', 401));
    }

    // Giải mã và kiểm tra chữ ký token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra xem User còn tồn tại trong Database không
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(new AppError('Tài khoản thuộc về Token này không còn tồn tại.', 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.', 403));
    }

    // Gắn thông tin User vào request để các Controller/Middleware tiếp theo sử dụng
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware phân quyền theo Role (RBAC)
 * @param  {...string} roles - Danh sách các role được phép truy cập (VD: 'ADMIN')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }
    next();
  };
};

/** Gắn người dùng nếu có Bearer token, nhưng vẫn cho phép khách vãng lai. */
const optionalAuthenticate = (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer ')) return next();
  return authenticateToken(req, res, next);
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuthenticate
};

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');
const ROLES = require('../constants/roles');

/**
 * Helper ký tạo JWT Access Token
 */
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

class AuthService {
  /**
   * Đăng ký tài khoản khách hàng mới
   */
  async register(userData) {
    const { fullName, email, password, phoneNumber } = userData;

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email này đã được đăng ký trong hệ thống.', 409, [
        { field: 'email', message: 'Email đã tồn tại' }
      ]);
    }

    // Tạo người dùng mới (Role mặc định: CUSTOMER)
    const newUser = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      role: ROLES.CUSTOMER
    });

    const token = signToken(newUser);

    return {
      user: newUser,
      token
    };
  }

  /**
   * Đăng nhập tài khoản
   */
  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    // Không tìm thấy email hoặc password sai -> trả cùng 1 thông báo chung để chống Enumeration Attack
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.', 403);
    }

    const token = signToken(user);

    return {
      user,
      token
    };
  }

  /**
   * Lấy thông tin cá nhân hiện tại
   */
  async getMe(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Không tìm thấy thông tin người dùng.', 404);
    }
    return user;
  }

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404);
    }

    const { fullName, phoneNumber, oldPassword, newPassword } = updateData;

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Nếu có yêu cầu đổi mật khẩu
    if (newPassword) {
      if (!oldPassword) {
        throw new AppError('Vui lòng nhập mật khẩu cũ để xác thực.', 400);
      }
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        throw new AppError('Mật khẩu cũ không chính xác.', 400);
      }
      if (newPassword.length < 6) {
        throw new AppError('Mật khẩu mới phải có tối thiểu 6 ký tự.', 400);
      }
      user.password = newPassword; // Hook beforeUpdate sẽ tự băm bcrypt
    }

    await user.save();
    return user;
  }
}

module.exports = new AuthService();

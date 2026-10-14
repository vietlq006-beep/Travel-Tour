const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, User, UserVerificationToken } = require('../models');
const notificationService = require('./notificationService');
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
  hashToken(value, namespace = '') {
    return crypto.createHash('sha256').update(`${namespace}:${String(value)}`).digest('hex');
  }

  async issueVerification(user, target, tokenType, options = {}) {
    const plainToken = options.numeric
      ? String(crypto.randomInt(100000, 1000000))
      : crypto.randomBytes(32).toString('hex');
    await UserVerificationToken.update({ consumedAt: new Date() }, {
      where: { userId: user.id, tokenType, consumedAt: null }
    });
    const expiresAt = new Date(Date.now() + (options.ttlMinutes || 30) * 60 * 1000);
    await UserVerificationToken.create({
      userId: user.id,
      target,
      tokenType,
      tokenHash: this.hashToken(plainToken, options.numeric ? `${tokenType}:${user.id}` : tokenType),
      expiresAt
    });
    const delivery = await notificationService.dispatch({
      channel: options.channel || 'email',
      target,
      template: tokenType,
      variables: { token: plainToken, expiresAt: expiresAt.toISOString(), fullName: user.fullName }
    });
    return {
      delivered: delivery.delivered,
      expiresAt,
      ...(process.env.NODE_ENV !== 'production' && { developmentToken: plainToken })
    };
  }

  async consumeToken(plainToken, tokenType, transaction, userId = null) {
    const item = await UserVerificationToken.findOne({
      where: {
        tokenHash: this.hashToken(plainToken, userId ? `${tokenType}:${userId}` : tokenType), tokenType, consumedAt: null,
        ...(userId && { userId }),
        expiresAt: { [Op.gt]: new Date() }
      },
      transaction,
      lock: transaction?.LOCK.UPDATE
    });
    if (!item) throw new AppError('Mã xác thực không hợp lệ hoặc đã hết hạn.', 422);
    await item.increment('attempts', { transaction });
    return item;
  }
  /**
   * Đăng ký tài khoản khách hàng mới
   */
  async register(userData) {
    const { fullName, password, phoneNumber } = userData;
    const email = userData.email.trim().toLowerCase();

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
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

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

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
      user.phoneNumber = phoneNumber || null;
      user.phoneVerifiedAt = null;
    }

    // Nếu có yêu cầu đổi mật khẩu
    if (newPassword) {
      if (!oldPassword) {
        throw new AppError('Vui lòng nhập mật khẩu cũ để xác thực.', 400);
      }
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        throw new AppError('Mật khẩu cũ không chính xác.', 400);
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(newPassword)) {
        throw new AppError('Mật khẩu mới chưa đạt yêu cầu bảo mật.', 422);
      }
      user.password = newPassword; // Hook beforeUpdate sẽ tự băm bcrypt
    }

    await user.save();
    return user;
  }

  async confirmContact(userId, contactData) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng.', 404);
    if (!await user.comparePassword(contactData.currentPassword)) {
      throw new AppError('Mật khẩu xác nhận không chính xác.', 401);
    }

    const email = contactData.email.trim().toLowerCase();
    const phoneNumber = contactData.phoneNumber.trim();
    const duplicatedEmail = await User.findOne({
      where: { email, id: { [Op.ne]: user.id } },
      attributes: ['id']
    });
    if (duplicatedEmail) throw new AppError('Email này đã được sử dụng bởi tài khoản khác.', 409, [
      { field: 'email', message: 'Email đã tồn tại' }
    ]);

    await user.update({
      email,
      phoneNumber,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date()
    });
    return { user, token: signToken(user) };
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase(), isActive: true } });
    if (!user) return { accepted: true };
    return { accepted: true, ...(await this.issueVerification(user, user.email, 'PASSWORD_RESET', { channel: 'email', ttlMinutes: 30 })) };
  }

  async resetPassword(token, newPassword) {
    await sequelize.transaction(async (transaction) => {
      const item = await this.consumeToken(token, 'PASSWORD_RESET', transaction);
      const user = await User.findByPk(item.userId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!user || !user.isActive) throw new AppError('Tài khoản không còn khả dụng.', 409);
      user.password = newPassword;
      await user.save({ transaction });
      await item.update({ consumedAt: new Date() }, { transaction });
      await UserVerificationToken.update({ consumedAt: new Date() }, {
        where: { userId: user.id, tokenType: 'PASSWORD_RESET', consumedAt: null }, transaction
      });
    });
    return { reset: true };
  }

  async requestEmailVerification(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng.', 404);
    if (user.emailVerifiedAt) return { verified: true };
    return this.issueVerification(user, user.email, 'EMAIL_VERIFICATION', { channel: 'email', ttlMinutes: 60 });
  }

  async confirmEmailVerification(userId, token) {
    return sequelize.transaction(async (transaction) => {
      const item = await this.consumeToken(token, 'EMAIL_VERIFICATION', transaction);
      if (item.userId !== userId) throw new AppError('Mã xác thực không thuộc tài khoản này.', 403);
      const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
      await user.update({ emailVerifiedAt: new Date() }, { transaction });
      await item.update({ consumedAt: new Date() }, { transaction });
      return { verified: true, user };
    });
  }

  async requestPhoneVerification(userId, phoneNumber) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng.', 404);
    return this.issueVerification(user, phoneNumber, 'PHONE_VERIFICATION', { channel: 'sms', ttlMinutes: 10, numeric: true });
  }

  async confirmPhoneVerification(userId, code) {
    return sequelize.transaction(async (transaction) => {
      const item = await this.consumeToken(code, 'PHONE_VERIFICATION', transaction, userId);
      const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
      await user.update({ phoneNumber: item.target, phoneVerifiedAt: new Date() }, { transaction });
      await item.update({ consumedAt: new Date() }, { transaction });
      return { verified: true, user };
    });
  }
}

module.exports = new AuthService();

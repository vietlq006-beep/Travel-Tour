const { Op } = require('sequelize');
const { User, Booking } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
class UserService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query.keyword) where[Op.or] = [
      { fullName: { [Op.like]: `%${query.keyword.trim()}%` } },
      { email: { [Op.like]: `%${query.keyword.trim()}%` } },
      { phoneNumber: { [Op.like]: `%${query.keyword.trim()}%` } }
    ];
    return toPaginatedResult(await User.findAndCountAll({ where, attributes: { exclude: ['password'] }, limit, offset, order: [['createdAt', 'DESC']] }), page, limit);
  }
  async get(id) {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] }, include: [{ model: Booking, as: 'bookings', attributes: ['id', 'bookingCode', 'status', 'finalAmount', 'bookingDate'] }] });
    if (!user) throw new AppError('Không tìm thấy người dùng.', 404);
    return user;
  }
  async update(id, data, currentAdminId) {
    if (Number(id) === Number(currentAdminId) && data.isActive === false) throw new AppError('Không thể tự khóa tài khoản đang đăng nhập.', 409);
    const user = await User.findByPk(id);
    if (!user) throw new AppError('Không tìm thấy người dùng.', 404);
    return user.update({ ...(data.role !== undefined && { role: data.role }), ...(data.isActive !== undefined && { isActive: data.isActive }) });
  }
}
module.exports = new UserService();

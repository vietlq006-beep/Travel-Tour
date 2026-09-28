const { Op } = require('sequelize');
const { Voucher, Booking } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
class VoucherService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.keyword ? { code: { [Op.like]: `%${query.keyword.trim()}%` } } : {};
    return toPaginatedResult(await Voucher.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] }), page, limit);
  }
  async get(id) { const item = await Voucher.findByPk(id); if (!item) throw new AppError('Không tìm thấy voucher.', 404); return item; }
  create(data) { return Voucher.create({ ...data, code: data.code.trim().toUpperCase() }); }
  async update(id, data) {
    const item = await this.get(id);
    const merged = { ...item.get(), ...data };
    if (new Date(merged.endDate) <= new Date(merged.startDate)) throw new AppError('Ngày kết thúc phải sau ngày bắt đầu.', 422);
    if (Number(merged.maxUsage) < item.usedCount) throw new AppError('Lượt dùng tối đa không được nhỏ hơn lượt đã dùng.', 409);
    if (data.code) data.code = data.code.trim().toUpperCase();
    return item.update(data);
  }
  async remove(id) {
    const item = await this.get(id);
    if (await Booking.count({ where: { voucherId: id } })) { await item.update({ isActive: false }); return true; }
    await item.destroy(); return false;
  }
  async calculate(code, totalAmount, options = {}) {
    if (!code) return { voucher: null, discountAmount: 0 };
    const now = new Date();
    const voucher = await Voucher.findOne({ where: { code: code.trim().toUpperCase(), isActive: true }, ...options });
    if (!voucher) throw new AppError('Mã voucher không tồn tại hoặc đã bị khóa.', 422);
    if (now < voucher.startDate || now > voucher.endDate) throw new AppError('Mã voucher chưa có hiệu lực hoặc đã hết hạn.', 422);
    if (voucher.usedCount >= voucher.maxUsage) throw new AppError('Mã voucher đã hết lượt sử dụng.', 422);
    if (Number(totalAmount) < Number(voucher.minBookingAmount)) throw new AppError('Đơn hàng chưa đạt giá trị tối thiểu của voucher.', 422);
    const rawDiscount = voucher.discountType === 'PERCENT' ? Number(totalAmount) * Number(voucher.discountValue) / 100 : Number(voucher.discountValue);
    return { voucher, discountAmount: Math.min(Number(totalAmount), rawDiscount) };
  }
}
module.exports = new VoucherService();

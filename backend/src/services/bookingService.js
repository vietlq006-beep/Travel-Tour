const crypto = require('crypto');
const { Op } = require('sequelize');
const {
  sequelize, Booking, BookingParticipant, TourDeparture, Tour, User, Voucher, Payment, Review
} = require('../models');
const voucherService = require('./voucherService');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

const bookingIncludes = [
  { model: TourDeparture, as: 'departure', include: [{ model: Tour, as: 'tour', attributes: ['id', 'code', 'name', 'thumbnail'] }] },
  { model: BookingParticipant, as: 'participants' },
  { model: Voucher, as: 'voucher', attributes: ['id', 'code', 'discountType', 'discountValue'] },
  { model: Payment, as: 'payments' }, { model: Review, as: 'review' }
];

const createBookingCode = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `LVT-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

class BookingService {
  async list(query, user) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (user.role !== 'ADMIN') where.userId = user.id;
    if (query.status) where.status = query.status;
    if (query.keyword) where.bookingCode = { [Op.like]: `%${query.keyword.trim()}%` };
    const include = [
      { model: TourDeparture, as: 'departure', include: [{ model: Tour, as: 'tour', attributes: ['id', 'code', 'name', 'thumbnail'] }] },
      ...(user.role === 'ADMIN' ? [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phoneNumber'] }] : [])
    ];
    return toPaginatedResult(await Booking.findAndCountAll({ where, include, distinct: true, limit, offset, order: [['bookingDate', 'DESC']] }), page, limit);
  }

  async getById(id, user) {
    const where = { id };
    if (user.role !== 'ADMIN') where.userId = user.id;
    const booking = await Booking.findOne({ where, include: bookingIncludes });
    if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    return booking;
  }

  async create(userId, data) {
    const bookingId = await sequelize.transaction(async (transaction) => {
      const departure = await TourDeparture.findByPk(data.departureId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!departure || departure.status !== 'OPEN') throw new AppError('Đợt khởi hành không còn mở bán.', 409);
      if (new Date(departure.startDate) <= new Date()) throw new AppError('Đợt khởi hành đã bắt đầu hoặc đã qua.', 409);
      const seats = Number(data.numAdults) + Number(data.numChildren || 0);
      if (departure.bookedSeats + seats > departure.capacity) throw new AppError(`Chỉ còn ${departure.remainingSeats} chỗ trống.`, 409);
      const totalAmount = Number(departure.adultPrice) * Number(data.numAdults)
        + Number(departure.childPrice) * Number(data.numChildren || 0);
      const { voucher, discountAmount } = await voucherService.calculate(data.voucherCode, totalAmount, {
        transaction, lock: transaction.LOCK.UPDATE
      });
      const booking = await Booking.create({
        bookingCode: createBookingCode(), userId, departureId: departure.id,
        voucherId: voucher?.id || null, numAdults: Number(data.numAdults), numChildren: Number(data.numChildren || 0),
        totalAmount, discountAmount, finalAmount: totalAmount - discountAmount, notes: data.notes
      }, { transaction });
      await BookingParticipant.bulkCreate(data.participants.map((person) => ({ ...person, bookingId: booking.id })), { transaction, validate: true });
      await departure.increment('bookedSeats', { by: seats, transaction });
      if (voucher) await voucher.increment('usedCount', { by: 1, transaction });
      return booking.id;
    });
    return this.getById(bookingId, { id: userId, role: 'CUSTOMER' });
  }

  async changeStatus(id, nextStatus, user) {
    const allowed = {
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      CANCELLED: [], COMPLETED: []
    };
    await sequelize.transaction(async (transaction) => {
      const where = { id, ...(user.role !== 'ADMIN' && { userId: user.id }) };
      const booking = await Booking.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });
      if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
      if (user.role !== 'ADMIN' && nextStatus !== 'CANCELLED') throw new AppError('Khách hàng chỉ có thể hủy đơn.', 403);
      if (user.role !== 'ADMIN' && booking.status !== 'PENDING_PAYMENT') throw new AppError('Đơn đã xác nhận cần liên hệ quản trị viên để xử lý hoàn tiền.', 409);
      if (!allowed[booking.status].includes(nextStatus)) throw new AppError(`Không thể chuyển từ ${booking.status} sang ${nextStatus}.`, 409);
      if (nextStatus === 'CANCELLED') {
        const successfulPayment = await Payment.findOne({ where: { bookingId: booking.id, status: 'SUCCESS' }, transaction, lock: transaction.LOCK.UPDATE });
        if (successfulPayment) throw new AppError('Cần hoàn tiền giao dịch thành công trước khi hủy đơn.', 409);
        const departure = await TourDeparture.findByPk(booking.departureId, { transaction, lock: transaction.LOCK.UPDATE });
        const seats = Number(booking.numAdults) + Number(booking.numChildren);
        await departure.decrement('bookedSeats', { by: Math.min(seats, departure.bookedSeats), transaction });
        if (booking.voucherId) {
          const voucher = await Voucher.findByPk(booking.voucherId, { transaction, lock: transaction.LOCK.UPDATE });
          if (voucher && voucher.usedCount > 0) await voucher.decrement('usedCount', { by: 1, transaction });
        }
        await Payment.update({ status: 'FAILED', responseData: { reason: 'BOOKING_CANCELLED' } }, {
          where: { bookingId: booking.id, status: 'PENDING' }, transaction
        });
      }
      await booking.update({ status: nextStatus }, { transaction });
    });
    return this.getById(id, user);
  }

  cancel(id, user) { return this.changeStatus(id, 'CANCELLED', user); }
}

module.exports = new BookingService();

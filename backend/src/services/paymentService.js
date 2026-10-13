const { sequelize, Payment, Booking, User, TourDeparture, Tour } = require('../models');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/paymentMethod');
const { createVietQrData } = require('./vietQrService');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
const AppError = require('../utils/appError');

class PaymentService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
    const result = await Payment.findAndCountAll({
      where,
      include: [{
        model: Booking,
        as: 'booking',
        attributes: ['id', 'bookingCode', 'bookingDate', 'finalAmount', 'status'],
        include: [
          { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phoneNumber'] },
          {
            model: TourDeparture,
            as: 'departure',
            attributes: ['id'],
            include: [{ model: Tour, as: 'tour', attributes: ['id', 'code', 'name'] }]
          }
        ]
      }],
      distinct: true,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    return toPaginatedResult(result, page, limit);
  }

  async create(data, user) {
    const booking = await Booking.findByPk(data.bookingId);
    if (!booking || (user.role !== 'ADMIN' && booking.userId !== user.id)) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    if (booking.status !== 'PENDING_PAYMENT') throw new AppError('Đơn không ở trạng thái chờ thanh toán.', 409);
    if (data.paymentMethod === PAYMENT_METHOD.CASH && user.role !== 'ADMIN') throw new AppError('Chỉ quản trị viên được ghi nhận thanh toán tiền mặt.', 403);
    const existing = await Payment.findOne({ where: { bookingId: booking.id, status: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS] } });
    if (existing) {
      if (existing.status === PAYMENT_STATUS.PENDING
        && existing.paymentMethod === PAYMENT_METHOD.VIETQR
        && data.paymentMethod === PAYMENT_METHOD.VIETQR) {
        return { payment: existing, vietQr: createVietQrData(booking, existing) };
      }
      throw new AppError('Đơn đã có giao dịch đang xử lý hoặc thành công.', 409);
    }
    const payment = await Payment.create({ bookingId: booking.id, paymentMethod: data.paymentMethod, amount: booking.finalAmount });
    const result = { payment };
    if (payment.paymentMethod === PAYMENT_METHOD.VIETQR) result.vietQr = createVietQrData(booking, payment);
    return result;
  }

  async updateStatus(id, status, metadata = {}) {
    return sequelize.transaction(async (transaction) => {
      const payment = await Payment.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!payment) throw new AppError('Không tìm thấy giao dịch.', 404);
      if (payment.status === status) return payment;
      const transitions = {
        [PAYMENT_STATUS.PENDING]: [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED],
        [PAYMENT_STATUS.SUCCESS]: [PAYMENT_STATUS.REFUNDED],
        [PAYMENT_STATUS.FAILED]: [], [PAYMENT_STATUS.REFUNDED]: []
      };
      if (!transitions[payment.status].includes(status)) throw new AppError(`Không thể chuyển giao dịch từ ${payment.status} sang ${status}.`, 409);
      if (status === PAYMENT_STATUS.FAILED && !metadata.rejectionReason?.trim()) {
        throw new AppError('Vui lòng nhập lý do từ chối giao dịch.', 422);
      }
      const booking = await Booking.findByPk(payment.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
      const responseData = status === PAYMENT_STATUS.FAILED
        ? {
          ...(payment.responseData && typeof payment.responseData === 'object' ? payment.responseData : {}),
          rejectionReason: metadata.rejectionReason.trim(),
          rejectedAt: new Date().toISOString(),
          rejectedBy: metadata.actor ? {
            id: metadata.actor.id,
            fullName: metadata.actor.fullName,
            email: metadata.actor.email
          } : undefined
        }
        : (metadata.responseData || payment.responseData);
      await payment.update({
        status, transactionId: metadata.transactionId || payment.transactionId,
        responseData,
        paymentTime: status === PAYMENT_STATUS.SUCCESS ? new Date() : payment.paymentTime
      }, { transaction });
      if (status === PAYMENT_STATUS.SUCCESS && booking.status === 'PENDING_PAYMENT') {
        await booking.update({ status: 'CONFIRMED' }, { transaction });
      }
      return payment;
    });
  }

  async listByBooking(bookingId, user) {
    const booking = await Booking.findByPk(bookingId, { include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }] });
    if (!booking || (user.role !== 'ADMIN' && booking.userId !== user.id)) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    return Payment.findAll({ where: { bookingId }, order: [['createdAt', 'DESC']] });
  }
}
module.exports = new PaymentService();

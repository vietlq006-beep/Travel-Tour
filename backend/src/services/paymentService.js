const { sequelize, Payment, Booking, User } = require('../models');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/paymentMethod');
const { createPaymentUrl, verifyCallback, assertConfigured } = require('./vnpayService');
const AppError = require('../utils/appError');

class PaymentService {
  async create(data, user, ipAddress) {
    const booking = await Booking.findByPk(data.bookingId);
    if (!booking || (user.role !== 'ADMIN' && booking.userId !== user.id)) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    if (booking.status !== 'PENDING_PAYMENT') throw new AppError('Đơn không ở trạng thái chờ thanh toán.', 409);
    if (data.paymentMethod === PAYMENT_METHOD.CASH && user.role !== 'ADMIN') throw new AppError('Chỉ quản trị viên được ghi nhận thanh toán tiền mặt.', 403);
    if (data.paymentMethod === PAYMENT_METHOD.VNPAY) assertConfigured();
    const existing = await Payment.findOne({ where: { bookingId: booking.id, status: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS] } });
    if (existing) throw new AppError('Đơn đã có giao dịch đang xử lý hoặc thành công.', 409);
    const payment = await Payment.create({ bookingId: booking.id, paymentMethod: data.paymentMethod, amount: booking.finalAmount });
    const result = { payment };
    if (payment.paymentMethod === PAYMENT_METHOD.VNPAY) {
      result.paymentUrl = createPaymentUrl({ paymentId: payment.id, amount: payment.amount, ipAddress, locale: data.locale, bankCode: data.bankCode });
    }
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
      const booking = await Booking.findByPk(payment.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
      await payment.update({
        status, transactionId: metadata.transactionId || payment.transactionId,
        responseData: metadata.responseData || payment.responseData,
        paymentTime: status === PAYMENT_STATUS.SUCCESS ? new Date() : payment.paymentTime
      }, { transaction });
      if (status === PAYMENT_STATUS.SUCCESS && booking.status === 'PENDING_PAYMENT') {
        await booking.update({ status: 'CONFIRMED' }, { transaction });
      }
      return payment;
    });
  }

  async handleVnPayCallback(query) {
    const { valid, params } = verifyCallback(query);
    if (!valid) return { rspCode: '97', message: 'Chữ ký không hợp lệ' };
    const payment = await Payment.findByPk(params.vnp_TxnRef);
    if (!payment) return { rspCode: '01', message: 'Không tìm thấy giao dịch' };
    if (Math.round(Number(payment.amount) * 100) !== Number(params.vnp_Amount)) return { rspCode: '04', message: 'Số tiền không hợp lệ' };
    if (payment.status !== PAYMENT_STATUS.PENDING) return { rspCode: '02', message: 'Giao dịch đã được cập nhật' };
    const success = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';
    await this.updateStatus(payment.id, success ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED, {
      transactionId: params.vnp_TransactionNo || null, responseData: params
    });
    return { rspCode: '00', message: success ? 'Thanh toán thành công' : 'Thanh toán thất bại', success, paymentId: payment.id };
  }

  async listByBooking(bookingId, user) {
    const booking = await Booking.findByPk(bookingId, { include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }] });
    if (!booking || (user.role !== 'ADMIN' && booking.userId !== user.id)) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    return Payment.findAll({ where: { bookingId }, order: [['createdAt', 'DESC']] });
  }
}
module.exports = new PaymentService();

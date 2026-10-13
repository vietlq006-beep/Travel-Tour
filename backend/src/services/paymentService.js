const crypto = require('crypto');
const { sequelize, Payment, Booking, User, TourDeparture, Tour, BookingActivity, PaymentReconciliationEvent } = require('../models');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/paymentMethod');
const { createVietQrData } = require('./vietQrService');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
const bookingService = require('./bookingService');
const AppError = require('../utils/appError');

const normalizeTransferContent = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

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
        attributes: ['id', 'bookingCode', 'bookingDate', 'finalAmount', 'depositAmount', 'status'],
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

  async paidTotal(bookingId, transaction) {
    return Number(await Payment.sum('amount', { where: { bookingId, status: PAYMENT_STATUS.SUCCESS }, transaction }) || 0);
  }

  async create(data, user) {
    await bookingService.expireBookingIfNeeded(data.bookingId);
    const booking = await Booking.findByPk(data.bookingId);
    if (!booking || (user.role !== 'ADMIN' && booking.userId !== user.id)) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status)) throw new AppError('Đơn không ở trạng thái có thể thanh toán.', 409);
    if (data.paymentMethod === PAYMENT_METHOD.CASH && user.role !== 'ADMIN') throw new AppError('Chỉ quản trị viên được ghi nhận thanh toán tiền mặt.', 403);

    const pending = await Payment.findOne({ where: { bookingId: booking.id, status: PAYMENT_STATUS.PENDING } });
    if (pending) {
      if (pending.paymentMethod === PAYMENT_METHOD.VIETQR && data.paymentMethod === PAYMENT_METHOD.VIETQR) {
        return { payment: pending, vietQr: createVietQrData(booking, pending) };
      }
      throw new AppError('Đơn đã có giao dịch đang xử lý.', 409);
    }

    const paid = await this.paidTotal(booking.id);
    const outstanding = Math.max(0, Number(booking.finalAmount) - paid);
    if (outstanding <= 0) throw new AppError('Đơn đã được thanh toán đủ.', 409);
    const requiredDeposit = Math.min(Number(booking.depositAmount || booking.finalAmount), Number(booking.finalAmount));
    const firstPayment = paid <= 0;
    const amount = firstPayment && requiredDeposit > 0 && requiredDeposit < Number(booking.finalAmount)
      ? requiredDeposit : outstanding;
    const paymentPurpose = amount >= outstanding
      ? (firstPayment ? 'FULL' : 'BALANCE')
      : 'DEPOSIT';
    const payment = await Payment.create({
      bookingId: booking.id,
      paymentMethod: data.paymentMethod,
      paymentPurpose,
      amount,
      provider: data.paymentMethod === PAYMENT_METHOD.VIETQR ? 'VIETQR' : null
    });
    const result = { payment, paidAmount: paid, outstandingAmount: outstanding };
    if (payment.paymentMethod === PAYMENT_METHOD.VIETQR) result.vietQr = createVietQrData(booking, payment);
    return result;
  }

  async applyStatus(payment, status, metadata, transaction) {
    if (payment.status === status) return payment;
    const transitions = {
      [PAYMENT_STATUS.PENDING]: [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED],
      [PAYMENT_STATUS.SUCCESS]: [PAYMENT_STATUS.REFUNDED],
      [PAYMENT_STATUS.FAILED]: [], [PAYMENT_STATUS.REFUNDED]: []
    };
    if (!transitions[payment.status]?.includes(status)) throw new AppError(`Không thể chuyển giao dịch từ ${payment.status} sang ${status}.`, 409);
    if (status === PAYMENT_STATUS.FAILED && !metadata.rejectionReason?.trim()) {
      throw new AppError('Vui lòng nhập lý do từ chối giao dịch.', 422);
    }
    const booking = await Booking.findByPk(payment.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ của giao dịch.', 404);
    const oldStatus = payment.status;
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
      status,
      transactionId: metadata.transactionId || payment.transactionId,
      provider: metadata.provider || payment.provider,
      responseData,
      paymentTime: status === PAYMENT_STATUS.SUCCESS ? (metadata.transactionTime || new Date()) : payment.paymentTime
    }, { transaction });

    if (status === PAYMENT_STATUS.SUCCESS && booking.status === 'PENDING_PAYMENT') {
      const paid = await this.paidTotal(booking.id, transaction);
      const activationAmount = Math.min(Number(booking.depositAmount || booking.finalAmount), Number(booking.finalAmount));
      if (paid >= activationAmount) await booking.update({ status: 'CONFIRMED', paymentDueAt: null }, { transaction });
    }
    await BookingActivity.create({
      bookingId: booking.id,
      actorId: metadata.actor?.id || null,
      eventType: status === PAYMENT_STATUS.REFUNDED ? 'PAYMENT_REFUNDED' : 'PAYMENT_STATUS_CHANGED',
      note: metadata.note || metadata.rejectionReason || null,
      metadata: { paymentId: payment.id, fromStatus: oldStatus, toStatus: status, transactionId: metadata.transactionId || payment.transactionId }
    }, { transaction });
    return payment;
  }

  async updateStatus(id, status, metadata = {}) {
    const result = await sequelize.transaction(async (transaction) => {
      const payment = await Payment.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!payment) throw new AppError('Không tìm thấy giao dịch.', 404);
      if (status === PAYMENT_STATUS.SUCCESS) {
        const booking = await Booking.findByPk(payment.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
        if (booking?.status === 'PENDING_PAYMENT' && await bookingService.expireLockedBooking(booking, transaction)) {
          return { expired: true };
        }
      }
      return this.applyStatus(payment, status, metadata, transaction);
    });
    if (result?.expired) throw new AppError('Đơn đã hết hạn thanh toán và ghế đã được hoàn.', 409);
    return result;
  }

  async uploadProof(id, fileUrl, user) {
    if (!fileUrl) throw new AppError('Vui lòng chọn ảnh chứng từ thanh toán.', 422);
    const payment = await Payment.findByPk(id, { include: [{ model: Booking, as: 'booking', attributes: ['id', 'userId'] }] });
    if (!payment || (user.role !== 'ADMIN' && payment.booking?.userId !== user.id)) throw new AppError('Không tìm thấy giao dịch.', 404);
    if (payment.status !== PAYMENT_STATUS.PENDING) throw new AppError('Chỉ giao dịch đang chờ mới được bổ sung chứng từ.', 409);
    await payment.update({ proofUrl: fileUrl, proofUploadedAt: new Date() });
    await BookingActivity.create({
      bookingId: payment.bookingId, actorId: user.id, eventType: 'PAYMENT_PROOF_UPLOADED', metadata: { paymentId: payment.id, proofUrl: fileUrl }
    });
    return payment;
  }

  async listByBooking(bookingId, user) {
    const booking = await Booking.findByPk(bookingId, { include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }] });
    if (!booking || (user.role !== 'ADMIN' && booking.userId !== user.id)) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    return Payment.findAll({ where: { bookingId }, order: [['createdAt', 'DESC']] });
  }

  async reconcileOne(input, source = 'STATEMENT_IMPORT', actor = null) {
    const externalTransactionId = String(input.externalTransactionId || '').trim();
    const amount = Number(input.amount);
    const transferContent = String(input.transferContent || '').trim();
    if (!externalTransactionId || !Number.isFinite(amount) || amount <= 0 || !transferContent) {
      throw new AppError('Dòng sao kê thiếu mã giao dịch, số tiền hoặc nội dung.', 422);
    }
    const existing = await PaymentReconciliationEvent.findOne({ where: { source, externalTransactionId } });
    if (existing) return { duplicate: true, event: existing };

    const eventHash = crypto.createHash('sha256').update(JSON.stringify({ source, externalTransactionId, amount, transferContent })).digest('hex');
    try {
      return await sequelize.transaction(async (transaction) => {
        const candidates = await Payment.findAll({
          where: { status: PAYMENT_STATUS.PENDING, amount },
          include: [{
            model: Booking,
            as: 'booking',
            attributes: ['id', 'bookingCode', 'status', 'paymentDueAt'],
            where: { status: ['PENDING_PAYMENT', 'CONFIRMED'] },
            required: true
          }],
          transaction,
          lock: transaction.LOCK.UPDATE,
          limit: 20
        });
        const normalized = normalizeTransferContent(transferContent);
        const payment = candidates.find((candidate) => normalized.includes(normalizeTransferContent(candidate.booking.bookingCode)));
        if (!payment) {
          const event = await PaymentReconciliationEvent.create({
            source, externalTransactionId, eventHash, transferContent, amount,
            transactionTime: input.transactionTime || null, status: 'UNMATCHED', rawData: input.rawData || input
          }, { transaction });
          return { matched: false, event };
        }
        if (payment.booking.status === 'PENDING_PAYMENT') {
          const lockedBooking = await Booking.findByPk(payment.booking.id, { transaction, lock: transaction.LOCK.UPDATE });
          if (await bookingService.expireLockedBooking(lockedBooking, transaction)) {
            const event = await PaymentReconciliationEvent.create({
              source, externalTransactionId, eventHash, paymentId: payment.id, transferContent, amount,
              transactionTime: input.transactionTime || null, status: 'REJECTED',
              rawData: { ...(input.rawData || input), rejectionReason: 'BOOKING_PAYMENT_EXPIRED' }
            }, { transaction });
            return { matched: false, expired: true, event };
          }
        }
        await this.applyStatus(payment, PAYMENT_STATUS.SUCCESS, {
          transactionId: externalTransactionId,
          provider: source,
          transactionTime: input.transactionTime ? new Date(input.transactionTime) : new Date(),
          responseData: { source, transferContent, reconciledAt: new Date().toISOString() },
          actor,
          note: 'Tự động đối soát theo số tiền và nội dung chuyển khoản.'
        }, transaction);
        const event = await PaymentReconciliationEvent.create({
          source, externalTransactionId, eventHash, paymentId: payment.id, transferContent, amount,
          transactionTime: input.transactionTime || null, status: 'MATCHED', rawData: input.rawData || input
        }, { transaction });
        return { matched: true, paymentId: payment.id, bookingCode: payment.booking.bookingCode, event };
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const event = await PaymentReconciliationEvent.findOne({ where: { source, externalTransactionId } });
        return { duplicate: true, event };
      }
      throw error;
    }
  }

  async reconcileMany(rows, source, actor) {
    const results = [];
    for (let index = 0; index < rows.length; index += 1) {
      try {
        results.push({ row: index + 2, ...(await this.reconcileOne(rows[index], source, actor)) });
      } catch (error) {
        results.push({ row: index + 2, error: error.message });
      }
    }
    return {
      total: results.length,
      matched: results.filter((item) => item.matched).length,
      duplicate: results.filter((item) => item.duplicate).length,
      unmatched: results.filter((item) => item.matched === false).length,
      failed: results.filter((item) => item.error).length,
      results
    };
  }
}

module.exports = new PaymentService();

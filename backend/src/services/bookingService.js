const crypto = require('crypto');
const QRCode = require('qrcode');
const { Op } = require('sequelize');
const {
  sequelize, Booking, BookingParticipant, TourDeparture, Tour, User, Voucher, Payment, Review,
  BookingActivity, BookingChangeRequest
} = require('../models');
const voucherService = require('./voucherService');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

const PAYMENT_TTL_MINUTES = Math.max(5, Number(process.env.BOOKING_PAYMENT_TTL_MINUTES) || 30);

const bookingIncludes = [
  {
    model: TourDeparture,
    as: 'departure',
    include: [{ model: Tour, as: 'tour', attributes: ['id', 'code', 'name', 'thumbnail'] }]
  },
  { model: BookingParticipant, as: 'participants' },
  { model: Voucher, as: 'voucher', attributes: ['id', 'code', 'discountType', 'discountValue'] },
  { model: Payment, as: 'payments' },
  { model: Review, as: 'review' },
  {
    model: BookingActivity,
    as: 'activities',
    separate: true,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'actor', attributes: ['id', 'fullName', 'email'] }]
  },
  {
    model: BookingChangeRequest,
    as: 'changeRequests',
    separate: true,
    order: [['createdAt', 'DESC']],
    include: [{ model: TourDeparture, as: 'requestedDeparture', attributes: ['id', 'startDate', 'endDate'] }]
  }
];

const createBookingCode = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `LVT-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const createCheckInCode = () => `LVT-CHECKIN-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
const money = (value) => Math.round(Number(value || 0));

class BookingService {
  async recordActivity(bookingId, eventType, data = {}, transaction) {
    return BookingActivity.create({
      bookingId,
      actorId: data.actorId || null,
      eventType,
      fromStatus: data.fromStatus || null,
      toStatus: data.toStatus || null,
      note: data.note?.trim() || null,
      metadata: data.metadata || null
    }, { transaction });
  }

  async releaseInventory(booking, transaction) {
    const departure = await TourDeparture.findByPk(booking.departureId, { transaction, lock: transaction.LOCK.UPDATE });
    if (departure) {
      const seats = Number(booking.numAdults) + Number(booking.numChildren)
        + Number(booking.numInfants || 0) + Number(booking.numSeniors || 0);
      await departure.decrement('bookedSeats', { by: Math.min(seats, Number(departure.bookedSeats)), transaction });
    }
    if (booking.voucherId) {
      const voucher = await Voucher.findByPk(booking.voucherId, { transaction, lock: transaction.LOCK.UPDATE });
      if (voucher && Number(voucher.usedCount) > 0) await voucher.decrement('usedCount', { by: 1, transaction });
    }
  }

  async expireLockedBooking(booking, transaction) {
    if (booking.status !== 'PENDING_PAYMENT') return false;
    if (!booking.paymentDueAt) {
      const legacyDueAt = new Date(new Date(booking.bookingDate || booking.createdAt).getTime() + PAYMENT_TTL_MINUTES * 60 * 1000);
      await booking.update({ paymentDueAt: legacyDueAt }, { transaction });
    }
    if (new Date(booking.paymentDueAt) > new Date()) return false;
    await this.releaseInventory(booking, transaction);
    await Payment.update({ status: 'FAILED', responseData: { reason: 'PAYMENT_TIMEOUT' } }, {
      where: { bookingId: booking.id, status: 'PENDING' }, transaction
    });
    await booking.update({
      status: 'CANCELLED',
      expiredAt: new Date(),
      cancellationReason: 'Đơn tự động hủy do quá hạn thanh toán.'
    }, { transaction });
    await this.recordActivity(booking.id, 'PAYMENT_EXPIRED', {
      fromStatus: 'PENDING_PAYMENT', toStatus: 'CANCELLED', note: 'Hệ thống tự động hoàn ghế và lượt voucher do quá hạn thanh toán.'
    }, transaction);
    return true;
  }

  async expirePendingBookings(limit = 100) {
    const ids = await Booking.findAll({
      where: { status: 'PENDING_PAYMENT', [Op.or]: [{ paymentDueAt: { [Op.lt]: new Date() } }, { paymentDueAt: null }] },
      attributes: ['id'], limit, order: [['paymentDueAt', 'ASC']], raw: true
    });
    let expired = 0;
    for (const { id } of ids) {
      const didExpire = await sequelize.transaction(async (transaction) => {
        const booking = await Booking.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
        return booking ? this.expireLockedBooking(booking, transaction) : false;
      });
      if (didExpire) expired += 1;
    }
    return expired;
  }

  async expireBookingIfNeeded(id) {
    return sequelize.transaction(async (transaction) => {
      const booking = await Booking.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!booking) return false;
      return this.expireLockedBooking(booking, transaction);
    });
  }

  async list(query, user) {
    await this.expirePendingBookings(25);
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (user.role !== 'ADMIN') where.userId = user.id;
    if (query.status) where.status = query.status;
    if (query.keyword) where.bookingCode = { [Op.like]: `%${query.keyword.trim()}%` };
    if (query.fromDate || query.toDate) where.bookingDate = {
      ...(query.fromDate && { [Op.gte]: new Date(`${query.fromDate}T00:00:00`) }),
      ...(query.toDate && { [Op.lte]: new Date(`${query.toDate}T23:59:59`) })
    };
    if (query.departureId) where.departureId = Number(query.departureId);
    const departureWhere = query.tourId ? { tourId: Number(query.tourId) } : undefined;
    const include = [
      {
        model: TourDeparture,
        as: 'departure',
        ...(departureWhere && { where: departureWhere, required: true }),
        include: [{ model: Tour, as: 'tour', attributes: ['id', 'code', 'name', 'thumbnail'] }]
      },
      ...(user.role === 'ADMIN' ? [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phoneNumber'] }] : []),
      ...(query.paymentStatus ? [{ model: Payment, as: 'payments', where: { status: query.paymentStatus }, attributes: ['id', 'status'], required: true }] : [])
    ];
    return toPaginatedResult(await Booking.findAndCountAll({
      where, include, distinct: true, limit, offset, order: [['bookingDate', 'DESC']]
    }), page, limit);
  }

  async getById(id, user) {
    await this.expireBookingIfNeeded(id);
    const where = { id };
    if (user.role !== 'ADMIN') where.userId = user.id;
    const include = [...bookingIncludes];
    if (user.role === 'ADMIN') include.push({ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phoneNumber'] });
    const booking = await Booking.findOne({ where, include });
    if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    return booking;
  }

  async getTicket(id, user) {
    const booking = await this.getById(id, user);
    if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
      throw new AppError('Vé check-in chỉ có sau khi đơn được xác nhận.', 409);
    }
    if (!booking.checkInCode) await booking.update({ checkInCode: createCheckInCode() });
    return {
      bookingCode: booking.bookingCode,
      checkInCode: booking.checkInCode,
      checkedInAt: booking.checkedInAt,
      qrCodeDataUrl: await QRCode.toDataURL(booking.checkInCode, {
        errorCorrectionLevel: 'M', margin: 2, width: 360,
        color: { dark: '#0b3b30', light: '#ffffff' }
      })
    };
  }

  async create(userId, data) {
    const bookingId = await sequelize.transaction(async (transaction) => {
      const departure = await TourDeparture.findByPk(data.departureId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!departure || departure.status !== 'OPEN') throw new AppError('Đợt khởi hành không còn mở bán.', 409);
      if (new Date(departure.startDate) <= new Date()) throw new AppError('Đợt khởi hành đã bắt đầu hoặc đã qua.', 409);
      const tour = await Tour.findByPk(departure.tourId, { transaction });
      if (!tour || !tour.isActive) throw new AppError('Tour không còn mở bán.', 409);

      const counts = {
        adults: Number(data.numAdults),
        children: Number(data.numChildren || 0),
        infants: Number(data.numInfants || 0),
        seniors: Number(data.numSeniors || 0),
        singleRooms: Number(data.singleRoomCount || 0)
      };
      const seats = counts.adults + counts.children + counts.infants + counts.seniors;
      if (Number(departure.bookedSeats) + seats > Number(departure.capacity)) {
        throw new AppError(`Chỉ còn ${departure.remainingSeats} chỗ trống.`, 409);
      }

      const prices = {
        adult: money(departure.adultPrice),
        child: money(departure.childPrice),
        infant: money(departure.infantPrice),
        senior: money(departure.seniorPrice ?? departure.adultPrice),
        singleRoomSurcharge: money(departure.singleRoomSurcharge)
      };
      const totalAmount = prices.adult * counts.adults + prices.child * counts.children
        + prices.infant * counts.infants + prices.senior * counts.seniors
        + prices.singleRoomSurcharge * counts.singleRooms;
      const { voucher, discountAmount } = await voucherService.calculate(data.voucherCode, totalAmount, {
        transaction, lock: transaction.LOCK.UPDATE
      });
      const finalAmount = totalAmount - Number(discountAmount);
      const depositPercent = Math.min(100, Math.max(0, Number(tour.depositPercent || 0)));
      const depositAmount = depositPercent > 0 ? Math.max(1, Math.round(finalAmount * depositPercent / 100)) : finalAmount;
      const paymentDueAt = new Date(Date.now() + PAYMENT_TTL_MINUTES * 60 * 1000);

      const pricingSnapshot = {
        currency: 'VND', counts, unitPrices: prices, totalAmount, discountAmount: Number(discountAmount),
        finalAmount, depositPercent, depositAmount, voucherCode: voucher?.code || null
      };
      const policySnapshot = {
        tourId: tour.id,
        departureId: departure.id,
        cancellationPolicy: tour.cancellationPolicy,
        changePolicy: tour.changePolicy,
        childPolicy: tour.childPolicy,
        infantPolicy: tour.infantPolicy,
        seniorPolicy: tour.seniorPolicy,
        includedServices: tour.includedServices,
        excludedServices: tour.excludedServices,
        pickupPoints: tour.pickupPoints,
        meetingInstructions: departure.termsOverride || tour.meetingInstructions,
        meetingPoint: departure.meetingPoint,
        meetingTime: departure.meetingTime,
        luggagePolicy: tour.luggagePolicy,
        insuranceDetails: tour.insuranceDetails,
        visaRequirements: tour.visaRequirements,
        requiredDocuments: tour.requiredDocuments,
        termsAndConditions: departure.termsOverride || tour.termsAndConditions
      };

      const booking = await Booking.create({
        bookingCode: createBookingCode(), userId, departureId: departure.id,
        voucherId: voucher?.id || null,
        numAdults: counts.adults, numChildren: counts.children, numInfants: counts.infants,
        numSeniors: counts.seniors, singleRoomCount: counts.singleRooms,
        totalAmount, discountAmount, finalAmount, depositAmount, paymentDueAt,
        notes: data.notes, pricingSnapshot, policySnapshot, checkInCode: createCheckInCode()
      }, { transaction });
      await BookingParticipant.bulkCreate(data.participants.map((person) => ({ ...person, bookingId: booking.id })), { transaction, validate: true });
      await departure.increment('bookedSeats', { by: seats, transaction });
      if (voucher) await voucher.increment('usedCount', { by: 1, transaction });
      await this.recordActivity(booking.id, 'BOOKING_CREATED', {
        actorId: userId, toStatus: 'PENDING_PAYMENT', note: `Giữ chỗ trong ${PAYMENT_TTL_MINUTES} phút.`, metadata: { paymentDueAt }
      }, transaction);
      return booking.id;
    });
    return this.getById(bookingId, { id: userId, role: 'CUSTOMER' });
  }

  async changeStatus(id, nextStatus, user, options = {}) {
    const allowed = {
      PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      CANCELLED: [], COMPLETED: []
    };
    await sequelize.transaction(async (transaction) => {
      const where = { id, ...(user.role !== 'ADMIN' && { userId: user.id }) };
      const booking = await Booking.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });
      if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
      await this.expireLockedBooking(booking, transaction);
      if (booking.status === 'CANCELLED') throw new AppError('Đơn đã bị hủy hoặc hết hạn.', 409);
      if (user.role !== 'ADMIN' && nextStatus !== 'CANCELLED') throw new AppError('Khách hàng chỉ có thể hủy đơn.', 403);
      if (user.role !== 'ADMIN' && booking.status !== 'PENDING_PAYMENT') {
        throw new AppError('Đơn đã xác nhận cần gửi yêu cầu hủy/hoàn tiền.', 409);
      }
      if (!allowed[booking.status].includes(nextStatus)) throw new AppError(`Không thể chuyển từ ${booking.status} sang ${nextStatus}.`, 409);
      const previousStatus = booking.status;
      if (nextStatus === 'CANCELLED') {
        const successfulPayment = await Payment.findOne({ where: { bookingId: booking.id, status: 'SUCCESS' }, transaction, lock: transaction.LOCK.UPDATE });
        if (successfulPayment) throw new AppError('Cần hoàn tiền giao dịch thành công trước khi hủy đơn.', 409);
        await this.releaseInventory(booking, transaction);
        await Payment.update({ status: 'FAILED', responseData: { reason: 'BOOKING_CANCELLED' } }, {
          where: { bookingId: booking.id, status: 'PENDING' }, transaction
        });
      }
      await booking.update({
        status: nextStatus,
        ...(nextStatus === 'CANCELLED' && { cancellationReason: options.reason || 'Đơn được hủy theo yêu cầu.' })
      }, { transaction });
      await this.recordActivity(booking.id, 'STATUS_CHANGED', {
        actorId: user.id, fromStatus: previousStatus, toStatus: nextStatus, note: options.note || options.reason
      }, transaction);
    });
    return this.getById(id, user);
  }

  cancel(id, user, reason) { return this.changeStatus(id, 'CANCELLED', user, { reason }); }

  async addNote(id, note, user) {
    const booking = await Booking.findByPk(id);
    if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    await this.recordActivity(booking.id, 'ADMIN_NOTE', { actorId: user.id, note });
    return this.getById(id, user);
  }

  async checkIn(code, user) {
    return sequelize.transaction(async (transaction) => {
      const booking = await Booking.findOne({ where: { checkInCode: String(code).trim() }, transaction, lock: transaction.LOCK.UPDATE });
      if (!booking) throw new AppError('Mã check-in không hợp lệ.', 404);
      if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) throw new AppError('Đơn chưa đủ điều kiện check-in.', 409);
      if (!booking.checkedInAt) {
        await booking.update({ checkedInAt: new Date(), checkedInBy: user.id }, { transaction });
        await this.recordActivity(booking.id, 'CHECKED_IN', { actorId: user.id, note: 'Đã xác nhận khách check-in.' }, transaction);
      }
      return booking;
    });
  }

  async createChangeRequest(bookingId, data, user) {
    const booking = await Booking.findOne({ where: { id: bookingId, userId: user.id } });
    if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status)) throw new AppError('Đơn không còn đủ điều kiện yêu cầu thay đổi.', 409);
    if (await BookingChangeRequest.count({ where: { bookingId, status: 'PENDING' } })) {
      throw new AppError('Đơn đang có một yêu cầu chờ xử lý.', 409);
    }
    if (data.requestType === 'RESCHEDULE' && !data.requestedDepartureId) throw new AppError('Vui lòng chọn lịch khởi hành mới.', 422);
    const request = await BookingChangeRequest.create({
      bookingId, userId: user.id, requestType: data.requestType,
      requestedDepartureId: data.requestedDepartureId || null, reason: data.reason.trim()
    });
    await this.recordActivity(bookingId, 'CHANGE_REQUESTED', {
      actorId: user.id, note: data.reason, metadata: { requestId: request.id, requestType: request.requestType }
    });
    return request;
  }

  async listChangeRequests(query, user) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (user.role !== 'ADMIN') where.userId = user.id;
    if (query.status) where.status = query.status;
    if (query.requestType) where.requestType = query.requestType;
    return toPaginatedResult(await BookingChangeRequest.findAndCountAll({
      where,
      include: [
        { model: Booking, as: 'booking', attributes: ['id', 'bookingCode', 'status', 'finalAmount'] },
        { model: User, as: 'requester', attributes: ['id', 'fullName', 'email'] },
        { model: TourDeparture, as: 'requestedDeparture', attributes: ['id', 'startDate', 'endDate'] }
      ],
      distinct: true, limit, offset, order: [['createdAt', 'DESC']]
    }), page, limit);
  }

  async reviewChangeRequest(id, data, user) {
    await sequelize.transaction(async (transaction) => {
      const request = await BookingChangeRequest.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!request) throw new AppError('Không tìm thấy yêu cầu.', 404);
      if (request.status !== 'PENDING') throw new AppError('Yêu cầu đã được xử lý.', 409);
      const booking = await Booking.findByPk(request.bookingId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ.', 404);

      if (data.status === 'APPROVED') {
        if (request.requestType === 'RESCHEDULE') {
          const oldDeparture = await TourDeparture.findByPk(booking.departureId, { transaction, lock: transaction.LOCK.UPDATE });
          const nextDeparture = await TourDeparture.findByPk(request.requestedDepartureId, { transaction, lock: transaction.LOCK.UPDATE });
          if (!nextDeparture || nextDeparture.status !== 'OPEN' || new Date(nextDeparture.startDate) <= new Date()) {
            throw new AppError('Lịch khởi hành mới không còn khả dụng.', 409);
          }
          if (nextDeparture.tourId !== oldDeparture.tourId) throw new AppError('Chỉ được đổi lịch trong cùng một tour.', 409);
          const seats = Number(booking.numAdults) + Number(booking.numChildren) + Number(booking.numInfants || 0) + Number(booking.numSeniors || 0);
          if (Number(nextDeparture.bookedSeats) + seats > Number(nextDeparture.capacity)) throw new AppError('Lịch mới không đủ chỗ.', 409);
          const newTotal = money(nextDeparture.adultPrice) * Number(booking.numAdults)
            + money(nextDeparture.childPrice) * Number(booking.numChildren)
            + money(nextDeparture.infantPrice) * Number(booking.numInfants || 0)
            + money(nextDeparture.seniorPrice ?? nextDeparture.adultPrice) * Number(booking.numSeniors || 0)
            + money(nextDeparture.singleRoomSurcharge) * Number(booking.singleRoomCount || 0);
          const newFinal = Math.max(0, newTotal - Number(booking.discountAmount));
          const hasSuccessfulPayment = await Payment.count({ where: { bookingId: booking.id, status: 'SUCCESS' }, transaction });
          if (hasSuccessfulPayment && newFinal !== money(booking.finalAmount)) {
            throw new AppError('Lịch mới chênh lệch giá; cần hoàn tiền/xử lý phần chênh lệch trước.', 409);
          }
          await oldDeparture.decrement('bookedSeats', { by: Math.min(seats, Number(oldDeparture.bookedSeats)), transaction });
          await nextDeparture.increment('bookedSeats', { by: seats, transaction });
          await Payment.update({ status: 'FAILED', responseData: { reason: 'RESCHEDULED' } }, { where: { bookingId: booking.id, status: 'PENDING' }, transaction });
          await booking.update({
            departureId: nextDeparture.id,
            totalAmount: newTotal,
            finalAmount: newFinal,
            pricingSnapshot: { ...(booking.pricingSnapshot || {}), totalAmount: newTotal, finalAmount: newFinal, rescheduledAt: new Date().toISOString() },
            ...(booking.status === 'PENDING_PAYMENT' && { paymentDueAt: new Date(Date.now() + PAYMENT_TTL_MINUTES * 60 * 1000) })
          }, { transaction });
        } else {
          const successfulPayment = await Payment.count({ where: { bookingId: booking.id, status: 'SUCCESS' }, transaction });
          if (successfulPayment) throw new AppError('Cần hoàn tiền các giao dịch thành công trước khi duyệt yêu cầu.', 409);
          if (request.requestType === 'REFUND') {
            const refunded = await Payment.count({ where: { bookingId: booking.id, status: 'REFUNDED' }, transaction });
            if (!refunded) throw new AppError('Chưa có giao dịch nào được ghi nhận hoàn tiền.', 409);
          }
          if (!['CANCELLED', 'COMPLETED'].includes(booking.status)) {
            await this.releaseInventory(booking, transaction);
            await booking.update({ status: 'CANCELLED', cancellationReason: data.adminNote || request.reason }, { transaction });
          }
        }
      }

      await request.update({ status: data.status, adminNote: data.adminNote || null, reviewedBy: user.id, reviewedAt: new Date() }, { transaction });
      await this.recordActivity(booking.id, 'CHANGE_REQUEST_REVIEWED', {
        actorId: user.id,
        note: data.adminNote,
        metadata: { requestId: request.id, requestType: request.requestType, decision: data.status }
      }, transaction);
    });
    return BookingChangeRequest.findByPk(id);
  }
}

module.exports = new BookingService();

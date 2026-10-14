const { Op } = require('sequelize');
const { Review, Booking, Tour, TourDeparture, User, Payment } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
class ReviewService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.rating) where.rating = Number(query.rating);
    if (query.tourId) where.tourId = Number(query.tourId);
    if (query.fromDate || query.toDate) where.createdAt = {
      ...(query.fromDate && { [Op.gte]: new Date(`${query.fromDate}T00:00:00`) }),
      ...(query.toDate && { [Op.lte]: new Date(`${query.toDate}T23:59:59`) })
    };
    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      where[Op.or] = [
        { comment: { [Op.like]: keyword } },
        { '$user.full_name$': { [Op.like]: keyword } },
        { '$user.email$': { [Op.like]: keyword } },
        { '$tour.name$': { [Op.like]: keyword } },
        { '$tour.code$': { [Op.like]: keyword } },
        { '$booking.booking_code$': { [Op.like]: keyword } }
      ];
    }
    const orderMap = {
      newest: [['createdAt', 'DESC']],
      oldest: [['createdAt', 'ASC']],
      rating_desc: [['rating', 'DESC'], ['createdAt', 'DESC']],
      rating_asc: [['rating', 'ASC'], ['createdAt', 'DESC']]
    };
    const result = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phoneNumber', 'avatar'] },
        { model: Tour, as: 'tour', attributes: ['id', 'code', 'name', 'thumbnail'] },
        { model: Booking, as: 'booking', attributes: ['id', 'bookingCode', 'status'] }
      ],
      distinct: true,
      subQuery: false,
      limit,
      offset,
      order: orderMap[query.sort] || orderMap.newest
    });
    return toPaginatedResult(result, page, limit);
  }

  async listByTour(tourId, query) {
    const { page, limit, offset } = getPagination(query);
    const result = await Review.findAndCountAll({
      where: { tourId }, include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'avatar'] }],
      limit, offset, order: [['createdAt', 'DESC']]
    });
    return toPaginatedResult(result, page, limit);
  }
  async create(userId, data) {
    const booking = await Booking.findOne({
      where: { id: data.bookingId, userId }, include: [{ model: TourDeparture, as: 'departure', attributes: ['tourId'] }]
    });
    if (!booking) throw new AppError('Không tìm thấy đơn đặt chỗ của bạn.', 404);
    const hasSuccessfulPayment = booking.status === 'CONFIRMED' && await Payment.count({
      where: { bookingId: booking.id, status: 'SUCCESS' }
    });
    if (booking.status !== 'COMPLETED' && !hasSuccessfulPayment) {
      throw new AppError('Chỉ có thể đánh giá đơn đã thanh toán thành công hoặc đã hoàn thành chuyến đi.', 409);
    }
    if (await Review.count({ where: { bookingId: booking.id } })) {
      throw new AppError('Đơn đặt chỗ này đã được đánh giá.', 409);
    }
    return Review.create({ userId, tourId: booking.departure.tourId, bookingId: booking.id, rating: Number(data.rating), comment: data.comment });
  }
  async update(id, data, user) {
    const review = await Review.findByPk(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá.', 404);
    if (user.role !== 'ADMIN' && review.userId !== user.id) throw new AppError('Bạn không có quyền sửa đánh giá này.', 403);
    return review.update({ ...(data.rating !== undefined && { rating: Number(data.rating) }), ...(data.comment !== undefined && { comment: data.comment }) });
  }
  async remove(id, user) {
    const review = await Review.findByPk(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá.', 404);
    if (user.role !== 'ADMIN' && review.userId !== user.id) throw new AppError('Bạn không có quyền xóa đánh giá này.', 403);
    await review.destroy();
  }
}
module.exports = new ReviewService();

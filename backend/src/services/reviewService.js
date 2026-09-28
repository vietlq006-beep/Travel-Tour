const { Review, Booking, TourDeparture, User } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
class ReviewService {
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
    if (booking.status !== 'COMPLETED') throw new AppError('Chỉ có thể đánh giá sau khi hoàn thành chuyến đi.', 409);
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

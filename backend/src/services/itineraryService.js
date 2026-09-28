const { sequelize, Tour, TourItinerary } = require('../models');
const AppError = require('../utils/appError');
class ItineraryService {
  async getTour(tourId, transaction) {
    const tour = await Tour.findByPk(tourId, { transaction });
    if (!tour) throw new AppError('Không tìm thấy tour.', 404);
    return tour;
  }
  async list(tourId) {
    await this.getTour(tourId);
    return TourItinerary.findAll({ where: { tourId }, order: [['dayNumber', 'ASC']] });
  }
  async create(tourId, data) {
    const tour = await this.getTour(tourId);
    if (Number(data.dayNumber) > tour.durationDays) throw new AppError('Ngày lịch trình vượt quá thời lượng tour.', 422);
    return TourItinerary.create({ ...data, tourId });
  }
  async update(tourId, id, data) {
    const tour = await this.getTour(tourId);
    if (data.dayNumber && Number(data.dayNumber) > tour.durationDays) throw new AppError('Ngày lịch trình vượt quá thời lượng tour.', 422);
    const item = await TourItinerary.findOne({ where: { id, tourId } });
    if (!item) throw new AppError('Không tìm thấy ngày lịch trình.', 404);
    return item.update(data);
  }
  async remove(tourId, id) {
    const item = await TourItinerary.findOne({ where: { id, tourId } });
    if (!item) throw new AppError('Không tìm thấy ngày lịch trình.', 404);
    await item.destroy();
  }
  async replaceAll(tourId, items) {
    const tour = await this.getTour(tourId);
    if (!Array.isArray(items) || items.length === 0) throw new AppError('Lịch trình phải có ít nhất một ngày.', 422);
    const days = items.map((item) => Number(item.dayNumber));
    if (new Set(days).size !== days.length || days.some((day) => day < 1 || day > tour.durationDays)) {
      throw new AppError('Số ngày lịch trình bị trùng hoặc vượt thời lượng tour.', 422);
    }
    await sequelize.transaction(async (transaction) => {
      await TourItinerary.destroy({ where: { tourId }, transaction });
      await TourItinerary.bulkCreate(items.map((item) => ({ ...item, tourId })), { transaction, validate: true });
    });
    return this.list(tourId);
  }
}
module.exports = new ItineraryService();

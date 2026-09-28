const { Op } = require('sequelize');
const { TourDeparture, Tour, Hotel, Vehicle, TourGuide, Booking } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

const includes = [
  { model: Tour, as: 'tour', attributes: ['id', 'code', 'name', 'thumbnail'] },
  { model: Hotel, as: 'hotel' }, { model: Vehicle, as: 'vehicle' }, { model: TourGuide, as: 'guide' }
];

class DepartureService {
  async list(query, isAdmin = false) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (!isAdmin) where.status = 'OPEN'; else if (query.status) where.status = query.status;
    if (query.tourId) where.tourId = Number(query.tourId);
    if (query.fromDate || query.toDate) where.startDate = {
      ...(query.fromDate && { [Op.gte]: query.fromDate }), ...(query.toDate && { [Op.lte]: query.toDate })
    };
    return toPaginatedResult(await TourDeparture.findAndCountAll({ where, include: includes, distinct: true, limit, offset, order: [['startDate', 'ASC']] }), page, limit);
  }
  async get(id, isAdmin = false) {
    const where = { id, ...(!isAdmin && { status: 'OPEN' }) };
    const item = await TourDeparture.findOne({ where, include: includes });
    if (!item) throw new AppError('Không tìm thấy đợt khởi hành.', 404);
    return item;
  }
  async validateReferences(data) {
    const checks = [[Tour, data.tourId, 'Tour'], [Hotel, data.hotelId, 'Khách sạn'], [Vehicle, data.vehicleId, 'Phương tiện'], [TourGuide, data.guideId, 'Hướng dẫn viên']];
    for (const [Model, id, label] of checks) {
      if (id && !await Model.findByPk(id)) throw new AppError(`${label} không tồn tại.`, 422);
    }
  }
  async ensureResourceAvailable(data, excludeId) {
    for (const field of ['vehicleId', 'guideId']) {
      if (!data[field] || !data.startDate || !data.endDate) continue;
      const conflict = await TourDeparture.findOne({ where: {
        [field]: data[field], status: { [Op.ne]: 'CANCELLED' },
        startDate: { [Op.lte]: data.endDate }, endDate: { [Op.gte]: data.startDate },
        ...(excludeId && { id: { [Op.ne]: excludeId } })
      } });
      if (conflict) throw new AppError(`${field === 'vehicleId' ? 'Phương tiện' : 'Hướng dẫn viên'} đã có lịch trùng thời gian.`, 409);
    }
  }
  async create(data) {
    await this.validateReferences(data);
    await this.ensureResourceAvailable(data);
    return TourDeparture.create(data);
  }
  async update(id, data) {
    const item = await TourDeparture.findByPk(id);
    if (!item) throw new AppError('Không tìm thấy đợt khởi hành.', 404);
    if (data.capacity !== undefined && Number(data.capacity) < item.bookedSeats) throw new AppError('Sức chứa không được nhỏ hơn số chỗ đã đặt.', 409);
    const merged = { ...item.get(), ...data };
    if (new Date(merged.endDate) < new Date(merged.startDate)) throw new AppError('Ngày kết thúc phải từ ngày bắt đầu trở đi.', 422);
    await this.validateReferences(data);
    await this.ensureResourceAvailable(merged, item.id);
    return item.update(data);
  }
  async remove(id) {
    const item = await TourDeparture.findByPk(id);
    if (!item) throw new AppError('Không tìm thấy đợt khởi hành.', 404);
    if (await Booking.count({ where: { departureId: id } })) throw new AppError('Đợt khởi hành đã có đơn đặt chỗ, hãy chuyển sang CANCELLED.', 409);
    await item.destroy();
  }
}
module.exports = new DepartureService();

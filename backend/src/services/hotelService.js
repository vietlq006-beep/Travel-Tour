const { Op } = require('sequelize');
const { Hotel, TourDeparture } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

class HotelService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.keyword ? { name: { [Op.like]: `%${query.keyword.trim()}%` } } : {};
    return toPaginatedResult(await Hotel.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] }), page, limit);
  }
  async get(id) {
    const item = await Hotel.findByPk(id);
    if (!item) throw new AppError('Không tìm thấy khách sạn.', 404);
    return item;
  }
  create(data) { return Hotel.create(data); }
  async update(id, data) { const item = await this.get(id); return item.update(data); }
  async remove(id) {
    const item = await this.get(id);
    if (await TourDeparture.count({ where: { hotelId: id } })) throw new AppError('Khách sạn đang được phân công cho đợt khởi hành.', 409);
    await item.destroy();
  }
}
module.exports = new HotelService();

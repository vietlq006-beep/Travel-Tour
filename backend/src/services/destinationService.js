const { Op } = require('sequelize');
const { Destination, Tour } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

class DestinationService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.region) where.region = query.region;
    if (query.keyword) where.name = { [Op.like]: `%${query.keyword.trim()}%` };
    const result = await Destination.findAndCountAll({ where, limit, offset, order: [['name', 'ASC']] });
    return toPaginatedResult(result, page, limit);
  }
  async getById(id) {
    const item = await Destination.findByPk(id, {
      include: [{ model: Tour, as: 'tours', through: { attributes: [] }, attributes: ['id', 'code', 'name', 'thumbnail'] }]
    });
    if (!item) throw new AppError('Không tìm thấy điểm đến.', 404);
    return item;
  }
  async create(data) {
    return Destination.create({ ...data, name: data.name.trim() });
  }
  async update(id, data) {
    const item = await Destination.findByPk(id);
    if (!item) throw new AppError('Không tìm thấy điểm đến.', 404);
    await item.update({ ...data, ...(data.name && { name: data.name.trim() }) });
    return item;
  }
  async remove(id) {
    const item = await Destination.findByPk(id);
    if (!item) throw new AppError('Không tìm thấy điểm đến.', 404);
    if (await item.countTours()) throw new AppError('Không thể xóa điểm đến đang thuộc một tour.', 409);
    await item.destroy();
  }
}

module.exports = new DestinationService();

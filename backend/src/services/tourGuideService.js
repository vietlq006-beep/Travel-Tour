const { Op } = require('sequelize');
const { TourGuide, TourDeparture } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
class TourGuideService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query.keyword) where[Op.or] = [
      { fullName: { [Op.like]: `%${query.keyword.trim()}%` } },
      { phoneNumber: { [Op.like]: `%${query.keyword.trim()}%` } }
    ];
    return toPaginatedResult(await TourGuide.findAndCountAll({ where, limit, offset, order: [['fullName', 'ASC']] }), page, limit);
  }
  async get(id) { const item = await TourGuide.findByPk(id); if (!item) throw new AppError('Không tìm thấy hướng dẫn viên.', 404); return item; }
  create(data) { return TourGuide.create(data); }
  async update(id, data) { return (await this.get(id)).update(data); }
  async remove(id) { const item = await this.get(id); if (await TourDeparture.count({ where: { guideId: id } })) throw new AppError('Hướng dẫn viên đang được phân công cho đợt khởi hành.', 409); await item.destroy(); }
}
module.exports = new TourGuideService();

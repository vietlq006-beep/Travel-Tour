const { Op } = require('sequelize');
const { Vehicle, TourDeparture } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');
class VehicleService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.keyword ? { [Op.or]: [
      { vehicleType: { [Op.like]: `%${query.keyword.trim()}%` } },
      { licensePlate: { [Op.like]: `%${query.keyword.trim()}%` } }
    ] } : {};
    return toPaginatedResult(await Vehicle.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] }), page, limit);
  }
  async get(id) { const item = await Vehicle.findByPk(id); if (!item) throw new AppError('Không tìm thấy phương tiện.', 404); return item; }
  create(data) { return Vehicle.create({ ...data, licensePlate: data.licensePlate.toUpperCase() }); }
  async update(id, data) { const item = await this.get(id); if (data.licensePlate) data.licensePlate = data.licensePlate.toUpperCase(); return item.update(data); }
  async remove(id) { const item = await this.get(id); if (await TourDeparture.count({ where: { vehicleId: id } })) throw new AppError('Phương tiện đang được phân công cho đợt khởi hành.', 409); await item.destroy(); }
}
module.exports = new VehicleService();

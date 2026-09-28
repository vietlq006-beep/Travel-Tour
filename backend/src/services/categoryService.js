const { Op } = require('sequelize');
const { Category, Tour } = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

class CategoryService {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = query.keyword ? { name: { [Op.like]: `%${query.keyword.trim()}%` } } : {};
    const result = await Category.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
    return toPaginatedResult(result, page, limit);
  }

  async getById(id) {
    const category = await Category.findByPk(id, {
      include: [{ model: Tour, as: 'tours', attributes: ['id', 'code', 'name', 'thumbnail', 'isActive'] }]
    });
    if (!category) throw new AppError('Không tìm thấy danh mục.', 404);
    return category;
  }

  async create(data) {
    return Category.create({ ...data, name: data.name.trim() });
  }

  async update(id, data) {
    const category = await Category.findByPk(id);
    if (!category) throw new AppError('Không tìm thấy danh mục.', 404);
    await category.update({ ...data, ...(data.name && { name: data.name.trim() }) });
    return category;
  }

  async remove(id) {
    const category = await Category.findByPk(id);
    if (!category) throw new AppError('Không tìm thấy danh mục.', 404);
    if (await Tour.count({ where: { categoryId: id } })) {
      throw new AppError('Không thể xóa danh mục đang có tour.', 409);
    }
    await category.destroy();
  }
}

module.exports = new CategoryService();

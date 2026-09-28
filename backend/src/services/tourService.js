const { Op } = require('sequelize');
const {
  sequelize, Tour, Category, Destination, TourDeparture, TourItinerary, Review
} = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

const detailIncludes = [
  { model: Category, as: 'category', attributes: ['id', 'name'] },
  { model: Destination, as: 'destinations', through: { attributes: [] } },
  { model: TourItinerary, as: 'itineraries', separate: true, order: [['dayNumber', 'ASC']] },
  { model: TourDeparture, as: 'departures', where: { status: 'OPEN' }, required: false, separate: true, order: [['startDate', 'ASC']] },
  { model: Review, as: 'reviews', attributes: ['id', 'rating', 'comment', 'createdAt'], separate: true, order: [['createdAt', 'DESC']] }
];

class TourService {
  async list(query, isAdmin = false) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (!isAdmin) where.isActive = true;
    if (query.isActive !== undefined && isAdmin) where.isActive = query.isActive === 'true';
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    if (query.keyword) where[Op.or] = [
      { name: { [Op.like]: `%${query.keyword.trim()}%` } },
      { code: { [Op.like]: `%${query.keyword.trim()}%` } }
    ];
    const departureWhere = {};
    if (query.minPrice) departureWhere.adultPrice = { [Op.gte]: Number(query.minPrice) };
    if (query.maxPrice) departureWhere.adultPrice = { ...(departureWhere.adultPrice || {}), [Op.lte]: Number(query.maxPrice) };
    const include = [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Destination, as: 'destinations', through: { attributes: [] }, attributes: ['id', 'name', 'region'], ...(query.destinationId ? { where: { id: Number(query.destinationId) }, required: true } : {}) },
      { model: TourDeparture, as: 'departures', attributes: ['id', 'startDate', 'adultPrice', 'childPrice', 'capacity', 'bookedSeats', 'remainingSeats', 'status'], where: { ...departureWhere, ...(!isAdmin && { status: 'OPEN' }) }, required: Boolean(query.minPrice || query.maxPrice) }
    ];
    const result = await Tour.findAndCountAll({ where, include, distinct: true, limit, offset, order: [['createdAt', 'DESC']] });
    return toPaginatedResult(result, page, limit);
  }

  async getById(id, isAdmin = false) {
    const where = { id };
    if (!isAdmin) where.isActive = true;
    const tour = await Tour.findOne({ where, include: detailIncludes });
    if (!tour) throw new AppError('Không tìm thấy tour.', 404);
    const rating = await Review.findOne({
      where: { tourId: id },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      raw: true
    });
    return { ...tour.toJSON(), rating: { average: Number(rating.average || 0), count: Number(rating.count || 0) } };
  }
}

module.exports = new TourService();

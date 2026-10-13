const { Op } = require('sequelize');
const {
  sequelize, Tour, Category, Destination, TourDeparture, TourItinerary, Review, User, Vehicle, Booking
} = require('../models');
const AppError = require('../utils/appError');
const { getPagination, toPaginatedResult } = require('../utils/pagination');

const detailIncludes = [
  { model: Category, as: 'category', attributes: ['id', 'name'] },
  { model: Destination, as: 'destinations', through: { attributes: [] } },
  { model: TourItinerary, as: 'itineraries', separate: true, order: [['dayNumber', 'ASC']] },
  { model: TourDeparture, as: 'departures', where: { status: 'OPEN', startDate: { [Op.gt]: new Date().toISOString().slice(0, 10) } }, required: false, separate: true, order: [['startDate', 'ASC']] },
  {
    model: Review,
    as: 'reviews',
    attributes: ['id', 'rating', 'comment', 'createdAt'],
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'avatar'] }],
    separate: true,
    order: [['createdAt', 'DESC']],
    limit: 20
  }
];

const ratingAverageSql = '(SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.tour_id = Tour.id)';
const ratingCountSql = '(SELECT COUNT(*) FROM reviews r WHERE r.tour_id = Tour.id)';
const bookingCountSql = `(SELECT COUNT(*) FROM bookings b
  INNER JOIN tour_departures td_pop ON td_pop.id = b.departure_id
  WHERE td_pop.tour_id = Tour.id AND b.status IN ('CONFIRMED','COMPLETED'))`;
const minPriceSql = `(SELECT MIN(td_price.adult_price) FROM tour_departures td_price
  WHERE td_price.tour_id = Tour.id AND td_price.status = 'OPEN' AND td_price.start_date > CURRENT_DATE())`;
const nextDepartureSql = `(SELECT MIN(td_date.start_date) FROM tour_departures td_date
  WHERE td_date.tour_id = Tour.id AND td_date.status = 'OPEN' AND td_date.start_date > CURRENT_DATE())`;

class TourService {
  async list(query, isAdmin = false) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (!isAdmin) where.isActive = true;
    if (query.isActive !== undefined && isAdmin) where.isActive = query.isActive === 'true';
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    if (query.minDuration) where.durationDays = { ...(where.durationDays || {}), [Op.gte]: Number(query.minDuration) };
    if (query.maxDuration) where.durationDays = { ...(where.durationDays || {}), [Op.lte]: Number(query.maxDuration) };
    if (query.keyword) where[Op.or] = [
      { name: { [Op.like]: `%${query.keyword.trim()}%` } },
      { code: { [Op.like]: `%${query.keyword.trim()}%` } }
    ];
    const departureWhere = {};
    if (query.minPrice) departureWhere.adultPrice = { [Op.gte]: Number(query.minPrice) };
    if (query.maxPrice) departureWhere.adultPrice = { ...(departureWhere.adultPrice || {}), [Op.lte]: Number(query.maxPrice) };
    const today = new Date().toISOString().slice(0, 10);
    if (!isAdmin) departureWhere.status = 'OPEN';
    departureWhere.startDate = {
      [Op.gte]: query.startDate && query.startDate > today ? query.startDate : today,
      ...(query.endDate && { [Op.lte]: query.endDate })
    };
    if (query.departureCity) departureWhere.departureCity = { [Op.like]: `%${query.departureCity.trim()}%` };
    if (query.minSeats) {
      departureWhere[Op.and] = sequelize.where(
        sequelize.literal('`departures`.`capacity` - `departures`.`booked_seats`'),
        { [Op.gte]: Number(query.minSeats) }
      );
    }
    if (query.minRating) {
      where[Op.and] = [...(where[Op.and] || []), sequelize.where(sequelize.literal(ratingAverageSql), { [Op.gte]: Number(query.minRating) })];
    }
    const vehicleInclude = {
      model: Vehicle,
      as: 'vehicle',
      attributes: ['id', 'vehicleType'],
      ...(query.vehicleType ? { where: { vehicleType: { [Op.like]: `%${query.vehicleType.trim()}%` } }, required: true } : {})
    };
    const departureRequired = Boolean(
      query.minPrice || query.maxPrice || query.startDate || query.endDate || query.departureCity
      || query.minSeats || query.vehicleType || !isAdmin
    );
    const include = [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Destination, as: 'destinations', through: { attributes: [] }, attributes: ['id', 'name', 'region'], ...(query.destinationId ? { where: { id: Number(query.destinationId) }, required: true } : {}) },
      {
        model: TourDeparture,
        as: 'departures',
        attributes: ['id', 'startDate', 'endDate', 'departureCity', 'adultPrice', 'childPrice', 'infantPrice', 'seniorPrice', 'singleRoomSurcharge', 'capacity', 'bookedSeats', 'remainingSeats', 'status'],
        where: departureWhere,
        required: departureRequired,
        include: [vehicleInclude]
      }
    ];
    const orderMap = {
      price_asc: [[sequelize.literal(minPriceSql), 'ASC']],
      price_desc: [[sequelize.literal(minPriceSql), 'DESC']],
      departure_asc: [[sequelize.literal(nextDepartureSql), 'ASC']],
      popular: [[sequelize.literal(bookingCountSql), 'DESC']],
      rating: [[sequelize.literal(ratingAverageSql), 'DESC']],
      newest: [['createdAt', 'DESC']]
    };
    const result = await Tour.findAndCountAll({
      where,
      include,
      attributes: {
        include: [
          [sequelize.literal(ratingAverageSql), 'averageRating'],
          [sequelize.literal(ratingCountSql), 'reviewCount'],
          [sequelize.literal(bookingCountSql), 'bookingCount']
        ]
      },
      distinct: true,
      limit,
      offset,
      order: orderMap[query.sort] || orderMap.newest
    });
    result.rows = result.rows.map((tour) => {
      const value = tour.toJSON();
      value.rating = { average: Number(value.averageRating || 0), count: Number(value.reviewCount || 0) };
      value.bookingCount = Number(value.bookingCount || 0);
      delete value.averageRating;
      delete value.reviewCount;
      return value;
    });
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

  async validateRelations(categoryId, destinationIds = [], transaction) {
    if (categoryId && !await Category.findByPk(categoryId, { transaction })) {
      throw new AppError('Danh mục tour không tồn tại.', 422);
    }
    if (destinationIds.length) {
      const count = await Destination.count({ where: { id: destinationIds }, transaction });
      if (count !== destinationIds.length) throw new AppError('Một hoặc nhiều điểm đến không tồn tại.', 422);
    }
  }

  async create(data) {
    const createdId = await sequelize.transaction(async (transaction) => {
      const { destinationIds = [], ...tourData } = data;
      await this.validateRelations(tourData.categoryId, destinationIds, transaction);
      tourData.code = tourData.code.trim().toUpperCase();
      tourData.name = tourData.name.trim();
      const tour = await Tour.create(tourData, { transaction });
      if (destinationIds.length) await tour.setDestinations(destinationIds, { transaction });
      return tour.id;
    });
    return this.getById(createdId, true);
  }

  async update(id, data) {
    await sequelize.transaction(async (transaction) => {
      const tour = await Tour.findByPk(id, { transaction });
      if (!tour) throw new AppError('Không tìm thấy tour.', 404);
      const { destinationIds, ...tourData } = data;
      await this.validateRelations(tourData.categoryId, destinationIds || [], transaction);
      if (tourData.code) tourData.code = tourData.code.trim().toUpperCase();
      if (tourData.name) tourData.name = tourData.name.trim();
      await tour.update(tourData, { transaction });
      if (destinationIds !== undefined) await tour.setDestinations(destinationIds, { transaction });
    });
    return this.getById(id, true);
  }

  async remove(id) {
    const tour = await Tour.findByPk(id);
    if (!tour) throw new AppError('Không tìm thấy tour.', 404);
    if (await TourDeparture.count({ where: { tourId: id } })) {
      await tour.update({ isActive: false });
      return { deactivated: true };
    }
    await tour.destroy();
    return { deactivated: false };
  }

  async recommendations(id, userId = null) {
    const tour = await Tour.findByPk(id, { include: [{ model: Destination, as: 'destinations', attributes: ['id'], through: { attributes: [] } }] });
    if (!tour) throw new AppError('Không tìm thấy tour.', 404);
    const destinationIds = tour.destinations.map((item) => item.id);
    const preferredCategoryIds = new Set([Number(tour.categoryId)]);
    if (userId) {
      const history = await Booking.findAll({
        where: { userId, status: { [Op.in]: ['CONFIRMED', 'COMPLETED'] } },
        attributes: ['id'],
        include: [{
          model: TourDeparture, as: 'departure', attributes: ['id'],
          include: [{ model: Tour, as: 'tour', attributes: ['categoryId'] }]
        }],
        order: [['bookingDate', 'DESC']], limit: 10
      });
      history.forEach((booking) => preferredCategoryIds.add(Number(booking.departure?.tour?.categoryId)));
    }
    const categorySql = [...preferredCategoryIds].filter(Number.isInteger).join(',') || Number(tour.categoryId);
    const rows = await Tour.findAll({
      where: { id: { [Op.ne]: tour.id }, isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        {
          model: Destination,
          as: 'destinations',
          attributes: ['id', 'name', 'region'],
          through: { attributes: [] },
          ...(destinationIds.length ? { where: { id: destinationIds }, required: false } : {})
        },
        {
          model: TourDeparture,
          as: 'departures',
          attributes: ['id', 'startDate', 'endDate', 'adultPrice', 'childPrice', 'remainingSeats'],
          where: { status: 'OPEN', startDate: { [Op.gt]: new Date().toISOString().slice(0, 10) } },
          required: true
        }
      ],
      attributes: { include: [[sequelize.literal(ratingAverageSql), 'averageRating'], [sequelize.literal(ratingCountSql), 'reviewCount']] },
      distinct: true,
      order: [
        [sequelize.literal(`CASE WHEN Tour.category_id IN (${categorySql}) THEN 0 ELSE 1 END`), 'ASC'],
        [sequelize.literal(ratingAverageSql), 'DESC']
      ],
      limit: 6,
      subQuery: false
    });
    return rows.map((item) => {
      const value = item.toJSON();
      value.rating = { average: Number(value.averageRating || 0), count: Number(value.reviewCount || 0) };
      delete value.averageRating;
      delete value.reviewCount;
      return value;
    });
  }
}

module.exports = new TourService();

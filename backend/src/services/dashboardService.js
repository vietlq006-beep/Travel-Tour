const { QueryTypes } = require('sequelize');
const { sequelize, User, Tour, TourDeparture, Booking } = require('../models');

class DashboardService {
  async summary() {
    const [customers, activeTours, openDepartures, bookingGroups, revenue] = await Promise.all([
      User.count({ where: { role: 'CUSTOMER', isActive: true } }),
      Tour.count({ where: { isActive: true } }),
      TourDeparture.count({ where: { status: 'OPEN' } }),
      Booking.findAll({ attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']], group: ['status'], raw: true }),
      Booking.sum('finalAmount', { where: { status: ['CONFIRMED', 'COMPLETED'] } })
    ]);
    return {
      customers, activeTours, openDepartures, revenue: Number(revenue || 0),
      bookingsByStatus: Object.fromEntries(bookingGroups.map((item) => [item.status, Number(item.count)]))
    };
  }

  async analytics({ fromDate, toDate }) {
    const replacements = { fromDate: fromDate || '2000-01-01', toDate: toDate || '2999-12-31' };
    const monthlyRevenue = await sequelize.query(`
      SELECT DATE_FORMAT(booking_date, '%Y-%m') AS month,
             COUNT(*) AS bookingCount, SUM(final_amount) AS revenue
      FROM bookings
      WHERE status IN ('CONFIRMED', 'COMPLETED') AND DATE(booking_date) BETWEEN :fromDate AND :toDate
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m') ORDER BY month ASC
    `, { replacements, type: QueryTypes.SELECT });
    const topTours = await sequelize.query(`
      SELECT t.id, t.code, t.name, COUNT(b.id) AS bookingCount,
             COALESCE(SUM(b.num_adults + b.num_children), 0) AS passengers,
             COALESCE(SUM(b.final_amount), 0) AS revenue
      FROM tours t
      JOIN tour_departures d ON d.tour_id = t.id
      JOIN bookings b ON b.departure_id = d.id AND b.status IN ('CONFIRMED', 'COMPLETED')
      WHERE DATE(b.booking_date) BETWEEN :fromDate AND :toDate
      GROUP BY t.id, t.code, t.name ORDER BY revenue DESC LIMIT 10
    `, { replacements, type: QueryTypes.SELECT });
    return {
      monthlyRevenue: monthlyRevenue.map((item) => ({ ...item, bookingCount: Number(item.bookingCount), revenue: Number(item.revenue) })),
      topTours: topTours.map((item) => ({ ...item, bookingCount: Number(item.bookingCount), passengers: Number(item.passengers), revenue: Number(item.revenue) }))
    };
  }
}
module.exports = new DashboardService();

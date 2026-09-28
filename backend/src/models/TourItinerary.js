const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourItinerary = sequelize.define('TourItinerary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tour_id'
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'day_number'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'tour_itineraries',
  indexes: [{ unique: true, fields: ['tour_id', 'day_number'], name: 'uq_itinerary_tour_day' }]
});

module.exports = TourItinerary;

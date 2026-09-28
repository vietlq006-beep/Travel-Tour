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
  tableName: 'tour_itineraries'
});

module.exports = TourItinerary;

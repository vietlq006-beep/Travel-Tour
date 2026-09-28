const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourDestination = sequelize.define('TourDestination', {
  tourId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'tour_id'
  },
  destinationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'destination_id'
  }
}, {
  tableName: 'tour_destinations',
  timestamps: false
});

module.exports = TourDestination;

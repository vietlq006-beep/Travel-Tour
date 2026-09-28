const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tour_id'
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'booking_id'
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reviews'
});

module.exports = Review;

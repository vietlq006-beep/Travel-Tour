const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id'
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  durationDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_days'
  },
  durationNights: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_nights'
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'tours',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Tour;

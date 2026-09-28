const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Destination = sequelize.define('Destination', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  region: {
    type: DataTypes.ENUM('BAC', 'TRUNG', 'NAM'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url'
  }
}, {
  tableName: 'destinations',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Destination;

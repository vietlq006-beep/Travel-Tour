const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  starRating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 3,
    field: 'star_rating',
    validate: { min: 1, max: 5 }
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'contact_phone'
  }
}, {
  tableName: 'hotels'
});

module.exports = Hotel;

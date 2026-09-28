const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TourGuide = sequelize.define('TourGuide', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name'
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phone_number'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  experienceYears: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    field: 'experience_years'
  },
  languages: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'tour_guides'
});

module.exports = TourGuide;

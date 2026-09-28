const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  discountType: {
    type: DataTypes.ENUM('PERCENT', 'FIXED'),
    allowNull: false,
    field: 'discount_type'
  },
  discountValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'discount_value'
  },
  minBookingAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'min_booking_amount'
  },
  maxUsage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    field: 'max_usage'
  },
  usedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'used_count'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'vouchers'
});

module.exports = Voucher;

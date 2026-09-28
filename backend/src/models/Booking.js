const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const BOOKING_STATUS = require('../constants/bookingStatus');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bookingCode: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    field: 'booking_code'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  departureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'departure_id'
  },
  voucherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'voucher_id'
  },
  numAdults: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: 'num_adults',
    validate: { min: 1 }
  },
  numChildren: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'num_children',
    validate: { min: 0 }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'discount_amount'
  },
  finalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'final_amount'
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'booking_date'
  },
  status: {
    type: DataTypes.ENUM(
      BOOKING_STATUS.PENDING_PAYMENT,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.COMPLETED
    ),
    allowNull: false,
    defaultValue: BOOKING_STATUS.PENDING_PAYMENT
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings'
});

module.exports = Booking;

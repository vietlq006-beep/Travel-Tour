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
  numInfants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'num_infants',
    validate: { min: 0 }
  },
  numSeniors: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'num_seniors',
    validate: { min: 0 }
  },
  singleRoomCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'single_room_count',
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
  depositAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'deposit_amount'
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'booking_date'
  },
  paymentDueAt: { type: DataTypes.DATE, allowNull: true, field: 'payment_due_at' },
  expiredAt: { type: DataTypes.DATE, allowNull: true, field: 'expired_at' },
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
  cancellationReason: { type: DataTypes.STRING(500), allowNull: true, field: 'cancellation_reason' },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pricingSnapshot: { type: DataTypes.JSON, allowNull: true, field: 'pricing_snapshot' },
  policySnapshot: { type: DataTypes.JSON, allowNull: true, field: 'policy_snapshot' },
  checkInCode: { type: DataTypes.STRING(64), allowNull: true, unique: true, field: 'check_in_code' },
  checkedInAt: { type: DataTypes.DATE, allowNull: true, field: 'checked_in_at' },
  checkedInBy: { type: DataTypes.INTEGER, allowNull: true, field: 'checked_in_by' }
}, {
  tableName: 'bookings'
});

module.exports = Booking;

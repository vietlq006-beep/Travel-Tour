const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingChangeRequest = sequelize.define('BookingChangeRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookingId: { type: DataTypes.INTEGER, allowNull: false, field: 'booking_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  requestType: { type: DataTypes.ENUM('CANCEL', 'RESCHEDULE', 'REFUND'), allowNull: false, field: 'request_type' },
  requestedDepartureId: { type: DataTypes.INTEGER, allowNull: true, field: 'requested_departure_id' },
  reason: { type: DataTypes.STRING(1000), allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), allowNull: false, defaultValue: 'PENDING' },
  adminNote: { type: DataTypes.STRING(1000), allowNull: true, field: 'admin_note' },
  reviewedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'reviewed_by' },
  reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' }
}, { tableName: 'booking_change_requests' });

module.exports = BookingChangeRequest;

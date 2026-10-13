const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingActivity = sequelize.define('BookingActivity', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookingId: { type: DataTypes.INTEGER, allowNull: false, field: 'booking_id' },
  actorId: { type: DataTypes.INTEGER, allowNull: true, field: 'actor_id' },
  eventType: { type: DataTypes.STRING(40), allowNull: false, field: 'event_type' },
  fromStatus: { type: DataTypes.STRING(30), allowNull: true, field: 'from_status' },
  toStatus: { type: DataTypes.STRING(30), allowNull: true, field: 'to_status' },
  note: { type: DataTypes.STRING(1000), allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true }
}, { tableName: 'booking_activities' });

module.exports = BookingActivity;

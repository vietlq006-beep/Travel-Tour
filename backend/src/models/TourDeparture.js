const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const DEPARTURE_STATUS = require('../constants/departureStatus');

const TourDeparture = sequelize.define('TourDeparture', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tourId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tour_id'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  departureCity: { type: DataTypes.STRING(100), allowNull: true, field: 'departure_city' },
  meetingPoint: { type: DataTypes.STRING(255), allowNull: true, field: 'meeting_point' },
  meetingTime: { type: DataTypes.DATE, allowNull: true, field: 'meeting_time' },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  bookedSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'booked_seats'
  },
  adultPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'adult_price',
    validate: { min: 0.01 }
  },
  childPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'child_price',
    validate: { min: 0 }
  },
  infantPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'infant_price',
    validate: { min: 0 }
  },
  seniorPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'senior_price',
    validate: { min: 0 }
  },
  singleRoomSurcharge: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'single_room_surcharge',
    validate: { min: 0 }
  },
  termsOverride: { type: DataTypes.TEXT, allowNull: true, field: 'terms_override' },
  hotelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'hotel_id'
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'vehicle_id'
  },
  guideId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'guide_id'
  },
  status: {
    type: DataTypes.ENUM(
      DEPARTURE_STATUS.OPEN,
      DEPARTURE_STATUS.CLOSED,
      DEPARTURE_STATUS.COMPLETED,
      DEPARTURE_STATUS.CANCELLED
    ),
    allowNull: false,
    defaultValue: DEPARTURE_STATUS.OPEN
  },
  remainingSeats: {
    type: DataTypes.VIRTUAL,
    get() {
      const cap = this.getDataValue('capacity') || 0;
      const booked = this.getDataValue('bookedSeats') || 0;
      return Math.max(0, cap - booked);
    }
  }
}, {
  tableName: 'tour_departures',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = TourDeparture;

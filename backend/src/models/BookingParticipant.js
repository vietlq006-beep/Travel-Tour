const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingParticipant = sequelize.define('BookingParticipant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'booking_id'
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name'
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_of_birth'
  },
  passengerType: {
    type: DataTypes.ENUM('ADULT', 'CHILD'),
    allowNull: false,
    field: 'passenger_type'
  }
}, {
  tableName: 'booking_participants'
});

module.exports = BookingParticipant;

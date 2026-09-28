const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  vehicleType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'vehicle_type'
  },
  licensePlate: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    field: 'license_plate'
  },
  seatCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'seat_capacity'
  }
}, {
  tableName: 'vehicles'
});

module.exports = Vehicle;

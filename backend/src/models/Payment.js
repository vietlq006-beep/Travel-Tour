const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/paymentMethod');

const Payment = sequelize.define('Payment', {
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
  paymentMethod: {
    type: DataTypes.ENUM(
      PAYMENT_METHOD.CASH,
      PAYMENT_METHOD.BANK_TRANSFER,
      PAYMENT_METHOD.VNPAY
    ),
    allowNull: false,
    field: 'payment_method'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    field: 'transaction_id'
  },
  status: {
    type: DataTypes.ENUM(
      PAYMENT_STATUS.PENDING,
      PAYMENT_STATUS.SUCCESS,
      PAYMENT_STATUS.FAILED,
      PAYMENT_STATUS.REFUNDED
    ),
    allowNull: false,
    defaultValue: PAYMENT_STATUS.PENDING
  },
  paymentTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'payment_time'
  },
  responseData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'response_data'
  }
}, {
  tableName: 'payments'
});

module.exports = Payment;

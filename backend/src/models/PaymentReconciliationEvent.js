const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentReconciliationEvent = sequelize.define('PaymentReconciliationEvent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  source: { type: DataTypes.STRING(40), allowNull: false },
  externalTransactionId: { type: DataTypes.STRING(150), allowNull: false, field: 'external_transaction_id' },
  eventHash: { type: DataTypes.STRING(64), allowNull: false, field: 'event_hash' },
  paymentId: { type: DataTypes.INTEGER, allowNull: true, field: 'payment_id' },
  transferContent: { type: DataTypes.STRING(255), allowNull: true, field: 'transfer_content' },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  transactionTime: { type: DataTypes.DATE, allowNull: true, field: 'transaction_time' },
  status: { type: DataTypes.ENUM('MATCHED', 'UNMATCHED', 'DUPLICATE', 'REJECTED'), allowNull: false },
  rawData: { type: DataTypes.JSON, allowNull: true, field: 'raw_data' },
  processedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'processed_at' }
}, {
  tableName: 'payment_reconciliation_events',
  indexes: [{ unique: true, fields: ['source', 'external_transaction_id'] }]
});

module.exports = PaymentReconciliationEvent;

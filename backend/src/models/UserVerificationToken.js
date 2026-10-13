const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserVerificationToken = sequelize.define('UserVerificationToken', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  target: { type: DataTypes.STRING(190), allowNull: false },
  tokenType: {
    type: DataTypes.ENUM('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION'),
    allowNull: false,
    field: 'token_type'
  },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  consumedAt: { type: DataTypes.DATE, allowNull: true, field: 'consumed_at' },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: 'user_verification_tokens' });

module.exports = UserVerificationToken;

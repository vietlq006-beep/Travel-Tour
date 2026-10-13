const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id'
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  durationDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_days'
  },
  durationNights: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_nights'
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  includedServices: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'included_services'
  },
  excludedServices: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'excluded_services'
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_policy'
  },
  changePolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'change_policy'
  },
  depositPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'deposit_percent',
    validate: { min: 0, max: 100 }
  },
  childPolicy: { type: DataTypes.TEXT, allowNull: true, field: 'child_policy' },
  infantPolicy: { type: DataTypes.TEXT, allowNull: true, field: 'infant_policy' },
  seniorPolicy: { type: DataTypes.TEXT, allowNull: true, field: 'senior_policy' },
  pickupPoints: { type: DataTypes.JSON, allowNull: true, field: 'pickup_points' },
  meetingInstructions: { type: DataTypes.TEXT, allowNull: true, field: 'meeting_instructions' },
  luggagePolicy: { type: DataTypes.TEXT, allowNull: true, field: 'luggage_policy' },
  insuranceDetails: { type: DataTypes.TEXT, allowNull: true, field: 'insurance_details' },
  visaRequirements: { type: DataTypes.TEXT, allowNull: true, field: 'visa_requirements' },
  requiredDocuments: { type: DataTypes.TEXT, allowNull: true, field: 'required_documents' },
  termsAndConditions: { type: DataTypes.TEXT, allowNull: true, field: 'terms_and_conditions' },
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'video_url'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'tours',
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Tour;

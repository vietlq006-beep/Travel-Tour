const { isPositiveInteger, isValidDate } = require('./commonValidator');
const BOOKING_STATUS = require('../constants/bookingStatus');
const DEPARTURE_STATUS = require('../constants/departureStatus');
const ROLES = require('../constants/roles');

const validateBooleanText = (value) => value === undefined || ['true', 'false'].includes(value);

const validateTourQuery = (req) => {
  const errors = [];
  ['categoryId', 'destinationId'].forEach((field) => {
    if (req.query[field] !== undefined && !isPositiveInteger(req.query[field])) errors.push({ field, message: `${field} phải là số nguyên dương` });
  });
  ['minPrice', 'maxPrice'].forEach((field) => {
    if (req.query[field] !== undefined && (!Number.isFinite(Number(req.query[field])) || Number(req.query[field]) < 0)) errors.push({ field, message: `${field} phải là số không âm` });
  });
  if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined && Number(req.query.minPrice) > Number(req.query.maxPrice)) errors.push({ field: 'maxPrice', message: 'Giá tối đa phải từ giá tối thiểu trở lên' });
  if (!validateBooleanText(req.query.isActive)) errors.push({ field: 'isActive', message: 'isActive chỉ nhận true hoặc false' });
  return errors;
};

const validateDepartureQuery = (req) => {
  const errors = [];
  if (req.query.tourId !== undefined && !isPositiveInteger(req.query.tourId)) errors.push({ field: 'tourId', message: 'Mã tour không hợp lệ' });
  if (req.query.status && !Object.values(DEPARTURE_STATUS).includes(req.query.status)) errors.push({ field: 'status', message: 'Trạng thái không hợp lệ' });
  if (req.query.fromDate && !isValidDate(req.query.fromDate)) errors.push({ field: 'fromDate', message: 'Ngày bắt đầu không hợp lệ' });
  if (req.query.toDate && !isValidDate(req.query.toDate)) errors.push({ field: 'toDate', message: 'Ngày kết thúc không hợp lệ' });
  if (req.query.fromDate && req.query.toDate && new Date(req.query.fromDate) > new Date(req.query.toDate)) errors.push({ field: 'toDate', message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi' });
  return errors;
};

const validateBookingQuery = (req) => req.query.status && !Object.values(BOOKING_STATUS).includes(req.query.status)
  ? [{ field: 'status', message: 'Trạng thái đơn không hợp lệ' }] : [];

const validateUserQuery = (req) => {
  const errors = [];
  if (req.query.role && !Object.values(ROLES).includes(req.query.role)) errors.push({ field: 'role', message: 'Vai trò không hợp lệ' });
  if (!validateBooleanText(req.query.isActive)) errors.push({ field: 'isActive', message: 'isActive chỉ nhận true hoặc false' });
  return errors;
};

const validateDestinationQuery = (req) => req.query.region && !['BAC', 'TRUNG', 'NAM'].includes(req.query.region)
  ? [{ field: 'region', message: 'Vùng miền chỉ nhận BAC, TRUNG hoặc NAM' }] : [];

const validateActiveQuery = (req) => validateBooleanText(req.query.isActive)
  ? [] : [{ field: 'isActive', message: 'isActive chỉ nhận true hoặc false' }];

module.exports = {
  validateTourQuery, validateDepartureQuery, validateBookingQuery, validateUserQuery,
  validateDestinationQuery, validateActiveQuery, validateBooleanText
};

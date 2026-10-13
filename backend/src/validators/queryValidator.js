const { isPositiveInteger, isValidDate } = require('./commonValidator');
const BOOKING_STATUS = require('../constants/bookingStatus');
const { PAYMENT_STATUS } = require('../constants/paymentMethod');
const DEPARTURE_STATUS = require('../constants/departureStatus');
const ROLES = require('../constants/roles');

const validateBooleanText = (value) => value === undefined || ['true', 'false'].includes(value);

const validateDateRange = (query, fromField, toField) => {
  const errors = [];
  if (query[fromField] && !isValidDate(query[fromField])) errors.push({ field: fromField, message: 'Ngày bắt đầu không hợp lệ' });
  if (query[toField] && !isValidDate(query[toField])) errors.push({ field: toField, message: 'Ngày kết thúc không hợp lệ' });
  if (query[fromField] && query[toField] && new Date(query[fromField]) > new Date(query[toField])) {
    errors.push({ field: toField, message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi' });
  }
  return errors;
};

const validateTourQuery = (req) => {
  const errors = [];
  ['categoryId', 'destinationId', 'minDuration', 'maxDuration', 'minSeats'].forEach((field) => {
    if (req.query[field] !== undefined && !isPositiveInteger(req.query[field])) errors.push({ field, message: `${field} phải là số nguyên dương` });
  });
  ['minPrice', 'maxPrice'].forEach((field) => {
    if (req.query[field] !== undefined && (!Number.isFinite(Number(req.query[field])) || Number(req.query[field]) < 0)) errors.push({ field, message: `${field} phải là số không âm` });
  });
  if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined && Number(req.query.minPrice) > Number(req.query.maxPrice)) errors.push({ field: 'maxPrice', message: 'Giá tối đa phải từ giá tối thiểu trở lên' });
  if (req.query.minDuration !== undefined && req.query.maxDuration !== undefined && Number(req.query.minDuration) > Number(req.query.maxDuration)) errors.push({ field: 'maxDuration', message: 'Thời lượng tối đa phải từ thời lượng tối thiểu trở lên' });
  errors.push(...validateDateRange(req.query, 'startDate', 'endDate'));
  if (req.query.minRating !== undefined && (!Number.isFinite(Number(req.query.minRating)) || Number(req.query.minRating) < 0 || Number(req.query.minRating) > 5)) errors.push({ field: 'minRating', message: 'Điểm đánh giá phải từ 0 đến 5' });
  if (req.query.sort && !['price_asc', 'price_desc', 'departure_asc', 'popular', 'rating', 'newest'].includes(req.query.sort)) errors.push({ field: 'sort', message: 'Cách sắp xếp không hợp lệ' });
  ['keyword', 'departureCity', 'vehicleType'].forEach((field) => {
    if (req.query[field] !== undefined && (typeof req.query[field] !== 'string' || req.query[field].trim().length > 100)) errors.push({ field, message: `${field} không hợp lệ` });
  });
  if (!validateBooleanText(req.query.isActive)) errors.push({ field: 'isActive', message: 'isActive chỉ nhận true hoặc false' });
  return errors;
};

const validateDepartureQuery = (req) => {
  const errors = [];
  if (req.query.tourId !== undefined && !isPositiveInteger(req.query.tourId)) errors.push({ field: 'tourId', message: 'Mã tour không hợp lệ' });
  if (req.query.status && !Object.values(DEPARTURE_STATUS).includes(req.query.status)) errors.push({ field: 'status', message: 'Trạng thái không hợp lệ' });
  errors.push(...validateDateRange(req.query, 'fromDate', 'toDate'));
  return errors;
};

const validateBookingQuery = (req) => {
  const errors = [];
  if (req.query.status && !Object.values(BOOKING_STATUS).includes(req.query.status)) errors.push({ field: 'status', message: 'Trạng thái đơn không hợp lệ' });
  if (req.query.paymentStatus && !Object.values(PAYMENT_STATUS).includes(req.query.paymentStatus)) errors.push({ field: 'paymentStatus', message: 'Trạng thái thanh toán không hợp lệ' });
  ['tourId', 'departureId'].forEach((field) => {
    if (req.query[field] !== undefined && !isPositiveInteger(req.query[field])) errors.push({ field, message: `${field} không hợp lệ` });
  });
  errors.push(...validateDateRange(req.query, 'fromDate', 'toDate'));
  if (req.query.keyword !== undefined && (typeof req.query.keyword !== 'string' || req.query.keyword.trim().length > 100)) errors.push({ field: 'keyword', message: 'Từ khóa không hợp lệ' });
  return errors;
};

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

const isBlank = (value) => typeof value !== 'string' || value.trim().length === 0;
const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const isNonNegativeInteger = (value) => Number.isInteger(Number(value)) && Number(value) >= 0;
const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
const isValidDate = (value) => Boolean(value) && !Number.isNaN(Date.parse(value));

const validateIdParam = (req) => {
  if (!isPositiveInteger(req.params.id)) {
    return [{ field: 'id', message: 'Mã định danh phải là số nguyên dương' }];
  }
  return [];
};

const validatePagination = (req) => {
  const errors = [];
  if (req.query.page !== undefined && !isPositiveInteger(req.query.page)) {
    errors.push({ field: 'page', message: 'Trang phải là số nguyên dương' });
  }
  if (req.query.limit !== undefined && !isPositiveInteger(req.query.limit)) {
    errors.push({ field: 'limit', message: 'Số bản ghi phải là số nguyên dương' });
  }
  return errors;
};

module.exports = {
  isBlank,
  isPositiveInteger,
  isNonNegativeInteger,
  isPositiveNumber,
  isValidDate,
  validateIdParam,
  validatePagination
};

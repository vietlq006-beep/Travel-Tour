const { isPositiveInteger, isPositiveNumber, isValidDate } = require('./commonValidator');
const DEPARTURE_STATUS = require('../constants/departureStatus');

const validateDeparture = (req) => {
  const errors = [];
  const body = req.body;
  const required = req.method === 'POST';
  if ((required || body.tourId !== undefined) && !isPositiveInteger(body.tourId)) errors.push({ field: 'tourId', message: 'Tour không hợp lệ' });
  if ((required || body.startDate !== undefined) && !isValidDate(body.startDate)) errors.push({ field: 'startDate', message: 'Ngày bắt đầu không hợp lệ' });
  if ((required || body.endDate !== undefined) && !isValidDate(body.endDate)) errors.push({ field: 'endDate', message: 'Ngày kết thúc không hợp lệ' });
  if (body.startDate && body.endDate && new Date(body.endDate) < new Date(body.startDate)) errors.push({ field: 'endDate', message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi' });
  if ((required || body.capacity !== undefined) && !isPositiveInteger(body.capacity)) errors.push({ field: 'capacity', message: 'Sức chứa phải là số nguyên dương' });
  if ((required || body.adultPrice !== undefined) && !isPositiveNumber(body.adultPrice)) errors.push({ field: 'adultPrice', message: 'Giá người lớn phải lớn hơn 0' });
  if ((required || body.childPrice !== undefined) && (!Number.isFinite(Number(body.childPrice)) || Number(body.childPrice) < 0)) errors.push({ field: 'childPrice', message: 'Giá trẻ em không được âm' });
  ['hotelId', 'vehicleId', 'guideId'].forEach((field) => {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '' && !isPositiveInteger(body[field])) errors.push({ field, message: `${field} không hợp lệ` });
  });
  if (body.status !== undefined && !Object.values(DEPARTURE_STATUS).includes(body.status)) errors.push({ field: 'status', message: 'Trạng thái khởi hành không hợp lệ' });
  return errors;
};
module.exports = { validateDeparture };

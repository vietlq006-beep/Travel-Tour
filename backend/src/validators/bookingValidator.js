const { isBlank, isPositiveInteger, isNonNegativeInteger, isValidDate } = require('./commonValidator');
const BOOKING_STATUS = require('../constants/bookingStatus');

const validateCreateBooking = (req) => {
  const errors = [];
  const { departureId, numAdults, numChildren = 0, participants } = req.body;
  if (!isPositiveInteger(departureId)) errors.push({ field: 'departureId', message: 'Đợt khởi hành không hợp lệ' });
  if (!isPositiveInteger(numAdults)) errors.push({ field: 'numAdults', message: 'Phải có ít nhất một người lớn' });
  if (!isNonNegativeInteger(numChildren)) errors.push({ field: 'numChildren', message: 'Số trẻ em không hợp lệ' });
  const totalPeople = Number(numAdults || 0) + Number(numChildren || 0);
  if (!Array.isArray(participants) || participants.length !== totalPeople) {
    errors.push({ field: 'participants', message: 'Số hành khách phải khớp số người lớn và trẻ em' });
    return errors;
  }
  let adultCount = 0; let childCount = 0;
  participants.forEach((person, index) => {
    if (isBlank(person.fullName)) errors.push({ field: `participants.${index}.fullName`, message: 'Họ tên hành khách là bắt buộc' });
    if (!['MALE', 'FEMALE', 'OTHER'].includes(person.gender)) errors.push({ field: `participants.${index}.gender`, message: 'Giới tính không hợp lệ' });
    if (!isValidDate(person.dateOfBirth) || new Date(person.dateOfBirth) > new Date()) errors.push({ field: `participants.${index}.dateOfBirth`, message: 'Ngày sinh không hợp lệ' });
    if (person.passengerType === 'ADULT') adultCount += 1;
    else if (person.passengerType === 'CHILD') childCount += 1;
    else errors.push({ field: `participants.${index}.passengerType`, message: 'Loại hành khách không hợp lệ' });
  });
  if (adultCount !== Number(numAdults) || childCount !== Number(numChildren)) errors.push({ field: 'participants', message: 'Phân loại hành khách không khớp số lượng đặt' });
  return errors;
};

const validateBookingStatus = (req) => Object.values(BOOKING_STATUS).includes(req.body.status)
  ? [] : [{ field: 'status', message: 'Trạng thái đơn đặt chỗ không hợp lệ' }];

module.exports = { validateCreateBooking, validateBookingStatus };

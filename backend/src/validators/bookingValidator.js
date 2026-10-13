const { isBlank, isPositiveInteger, isNonNegativeInteger, isValidDate } = require('./commonValidator');
const BOOKING_STATUS = require('../constants/bookingStatus');

const validateCreateBooking = (req) => {
  const errors = [];
  const { departureId, numAdults, numChildren = 0, numInfants = 0, numSeniors = 0, singleRoomCount = 0, participants } = req.body;
  if (!isPositiveInteger(departureId)) errors.push({ field: 'departureId', message: 'Đợt khởi hành không hợp lệ' });
  if (!isPositiveInteger(numAdults)) errors.push({ field: 'numAdults', message: 'Phải có ít nhất một người lớn' });
  if (!isNonNegativeInteger(numChildren)) errors.push({ field: 'numChildren', message: 'Số trẻ em không hợp lệ' });
  if (!isNonNegativeInteger(numInfants)) errors.push({ field: 'numInfants', message: 'Số em bé không hợp lệ' });
  if (!isNonNegativeInteger(numSeniors)) errors.push({ field: 'numSeniors', message: 'Số người cao tuổi không hợp lệ' });
  if (!isNonNegativeInteger(singleRoomCount)) errors.push({ field: 'singleRoomCount', message: 'Số phòng đơn không hợp lệ' });
  const totalPeople = Number(numAdults || 0) + Number(numChildren || 0) + Number(numInfants || 0) + Number(numSeniors || 0);
  if (!Array.isArray(participants) || participants.length !== totalPeople) {
    errors.push({ field: 'participants', message: 'Số hành khách phải khớp tổng số người đã chọn' });
    return errors;
  }
  const passengerCounts = { ADULT: 0, CHILD: 0, INFANT: 0, SENIOR: 0 };
  participants.forEach((person, index) => {
    if (isBlank(person.fullName)) errors.push({ field: `participants.${index}.fullName`, message: 'Họ tên hành khách là bắt buộc' });
    if (!['MALE', 'FEMALE', 'OTHER'].includes(person.gender)) errors.push({ field: `participants.${index}.gender`, message: 'Giới tính không hợp lệ' });
    if (!isValidDate(person.dateOfBirth) || new Date(person.dateOfBirth) > new Date()) errors.push({ field: `participants.${index}.dateOfBirth`, message: 'Ngày sinh không hợp lệ' });
    if (Object.hasOwn(passengerCounts, person.passengerType)) passengerCounts[person.passengerType] += 1;
    else errors.push({ field: `participants.${index}.passengerType`, message: 'Loại hành khách không hợp lệ' });
  });
  if (passengerCounts.ADULT !== Number(numAdults)
    || passengerCounts.CHILD !== Number(numChildren)
    || passengerCounts.INFANT !== Number(numInfants)
    || passengerCounts.SENIOR !== Number(numSeniors)) {
    errors.push({ field: 'participants', message: 'Phân loại hành khách không khớp số lượng đặt' });
  }
  return errors;
};

const validateBookingStatus = (req) => Object.values(BOOKING_STATUS).includes(req.body.status)
  ? [] : [{ field: 'status', message: 'Trạng thái đơn đặt chỗ không hợp lệ' }];

const validateChangeRequest = (req) => {
  const errors = [];
  if (!['CANCEL', 'RESCHEDULE', 'REFUND'].includes(req.body.requestType)) errors.push({ field: 'requestType', message: 'Loại yêu cầu không hợp lệ' });
  if (typeof req.body.reason !== 'string' || req.body.reason.trim().length < 10 || req.body.reason.trim().length > 1000) {
    errors.push({ field: 'reason', message: 'Lý do phải từ 10 đến 1.000 ký tự' });
  }
  if (req.body.requestType === 'RESCHEDULE' && !isPositiveInteger(req.body.requestedDepartureId)) {
    errors.push({ field: 'requestedDepartureId', message: 'Lịch khởi hành mới không hợp lệ' });
  }
  return errors;
};

const validateChangeRequestDecision = (req) => {
  const errors = [];
  if (!['APPROVED', 'REJECTED'].includes(req.body.status)) errors.push({ field: 'status', message: 'Quyết định không hợp lệ' });
  if (req.body.adminNote !== undefined && (typeof req.body.adminNote !== 'string' || req.body.adminNote.length > 1000)) {
    errors.push({ field: 'adminNote', message: 'Ghi chú không được vượt quá 1.000 ký tự' });
  }
  return errors;
};

module.exports = { validateCreateBooking, validateBookingStatus, validateChangeRequest, validateChangeRequestDecision };

const { isBlank, isPositiveInteger } = require('./commonValidator');

const validateVehicle = (req) => {
  const errors = [];
  const { vehicleType, licensePlate, seatCapacity } = req.body;
  if (req.method === 'POST' && isBlank(vehicleType)) errors.push({ field: 'vehicleType', message: 'Loại xe là bắt buộc' });
  if (req.method === 'POST' && isBlank(licensePlate)) errors.push({ field: 'licensePlate', message: 'Biển số xe là bắt buộc' });
  if (licensePlate !== undefined && !/^[A-Za-z0-9.-]{4,30}$/.test(licensePlate)) {
    errors.push({ field: 'licensePlate', message: 'Biển số xe không hợp lệ' });
  }
  if ((req.method === 'POST' || seatCapacity !== undefined) && !isPositiveInteger(seatCapacity)) {
    errors.push({ field: 'seatCapacity', message: 'Sức chứa phải là số nguyên dương' });
  }
  return errors;
};
module.exports = { validateVehicle };

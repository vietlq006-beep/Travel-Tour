const { isBlank, isPositiveInteger } = require('./commonValidator');

const validateHotel = (req) => {
  const errors = [];
  const { name, address, starRating, contactPhone } = req.body;
  if (req.method === 'POST' && isBlank(name)) errors.push({ field: 'name', message: 'Tên khách sạn là bắt buộc' });
  if (req.method === 'POST' && isBlank(address)) errors.push({ field: 'address', message: 'Địa chỉ là bắt buộc' });
  if (starRating !== undefined && (!isPositiveInteger(starRating) || Number(starRating) > 5)) {
    errors.push({ field: 'starRating', message: 'Hạng sao phải là số nguyên từ 1 đến 5' });
  }
  if (contactPhone && !/^[0-9+]{9,15}$/.test(contactPhone)) {
    errors.push({ field: 'contactPhone', message: 'Số điện thoại không hợp lệ' });
  }
  return errors;
};

module.exports = { validateHotel };

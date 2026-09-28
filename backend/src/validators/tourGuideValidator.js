const { isBlank, isNonNegativeInteger } = require('./commonValidator');

const validateTourGuide = (req) => {
  const errors = [];
  const { fullName, phoneNumber, email, experienceYears } = req.body;
  if (req.method === 'POST' && isBlank(fullName)) errors.push({ field: 'fullName', message: 'Họ tên hướng dẫn viên là bắt buộc' });
  if (req.method === 'POST' && isBlank(phoneNumber)) errors.push({ field: 'phoneNumber', message: 'Số điện thoại là bắt buộc' });
  if (phoneNumber !== undefined && !/^[0-9+]{9,15}$/.test(phoneNumber)) errors.push({ field: 'phoneNumber', message: 'Số điện thoại không hợp lệ' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: 'email', message: 'Email không hợp lệ' });
  if (experienceYears !== undefined && (!isNonNegativeInteger(experienceYears) || Number(experienceYears) > 60)) {
    errors.push({ field: 'experienceYears', message: 'Số năm kinh nghiệm phải từ 0 đến 60' });
  }
  return errors;
};
module.exports = { validateTourGuide };

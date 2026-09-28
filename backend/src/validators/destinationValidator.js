const { isBlank } = require('./commonValidator');

const REGIONS = ['BAC', 'TRUNG', 'NAM'];

const validateDestination = (req) => {
  const errors = [];
  const { name, region } = req.body;
  if (req.method === 'POST' && isBlank(name)) errors.push({ field: 'name', message: 'Tên điểm đến không được để trống' });
  if (name !== undefined && (isBlank(name) || name.trim().length > 100)) {
    errors.push({ field: 'name', message: 'Tên điểm đến phải có từ 1 đến 100 ký tự' });
  }
  if (req.method === 'POST' && !region) errors.push({ field: 'region', message: 'Vùng miền là bắt buộc' });
  if (region !== undefined && !REGIONS.includes(region)) {
    errors.push({ field: 'region', message: 'Vùng miền chỉ nhận BAC, TRUNG hoặc NAM' });
  }
  return errors;
};

module.exports = { validateDestination, REGIONS };

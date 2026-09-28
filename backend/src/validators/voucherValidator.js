const { isBlank, isPositiveInteger, isPositiveNumber, isValidDate } = require('./commonValidator');
const validateVoucher = (req) => {
  const errors = [];
  const b = req.body;
  const required = req.method === 'POST';
  if (required && isBlank(b.code)) errors.push({ field: 'code', message: 'Mã voucher là bắt buộc' });
  if (b.code !== undefined && !/^[A-Za-z0-9_-]{3,30}$/.test(b.code)) errors.push({ field: 'code', message: 'Mã voucher không hợp lệ' });
  if ((required || b.discountType !== undefined) && !['PERCENT', 'FIXED'].includes(b.discountType)) errors.push({ field: 'discountType', message: 'Loại giảm giá không hợp lệ' });
  if ((required || b.discountValue !== undefined) && !isPositiveNumber(b.discountValue)) errors.push({ field: 'discountValue', message: 'Giá trị giảm phải lớn hơn 0' });
  if (b.discountType === 'PERCENT' && Number(b.discountValue) > 100) errors.push({ field: 'discountValue', message: 'Phần trăm giảm không vượt quá 100' });
  if (b.minBookingAmount !== undefined && (!Number.isFinite(Number(b.minBookingAmount)) || Number(b.minBookingAmount) < 0)) errors.push({ field: 'minBookingAmount', message: 'Giá trị đơn tối thiểu không được âm' });
  if ((required || b.maxUsage !== undefined) && !isPositiveInteger(b.maxUsage)) errors.push({ field: 'maxUsage', message: 'Lượt dùng tối đa phải là số nguyên dương' });
  if ((required || b.startDate !== undefined) && !isValidDate(b.startDate)) errors.push({ field: 'startDate', message: 'Ngày bắt đầu không hợp lệ' });
  if ((required || b.endDate !== undefined) && !isValidDate(b.endDate)) errors.push({ field: 'endDate', message: 'Ngày kết thúc không hợp lệ' });
  if (b.startDate && b.endDate && new Date(b.endDate) <= new Date(b.startDate)) errors.push({ field: 'endDate', message: 'Ngày kết thúc phải sau ngày bắt đầu' });
  if (b.isActive !== undefined && typeof b.isActive !== 'boolean') errors.push({ field: 'isActive', message: 'isActive phải là boolean' });
  return errors;
};
module.exports = { validateVoucher };

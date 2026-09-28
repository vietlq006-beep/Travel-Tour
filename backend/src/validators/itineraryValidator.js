const { isBlank, isPositiveInteger } = require('./commonValidator');

const validateItinerary = (req) => {
  const errors = [];
  const { dayNumber, title, description } = req.body;
  if ((req.method === 'POST' || dayNumber !== undefined) && !isPositiveInteger(dayNumber)) {
    errors.push({ field: 'dayNumber', message: 'Ngày thứ phải là số nguyên dương' });
  }
  if (req.method === 'POST' && isBlank(title)) errors.push({ field: 'title', message: 'Tiêu đề lịch trình là bắt buộc' });
  if (req.method === 'POST' && isBlank(description)) errors.push({ field: 'description', message: 'Nội dung lịch trình là bắt buộc' });
  if (title !== undefined && (isBlank(title) || title.length > 200)) errors.push({ field: 'title', message: 'Tiêu đề có từ 1 đến 200 ký tự' });
  return errors;
};
module.exports = { validateItinerary };

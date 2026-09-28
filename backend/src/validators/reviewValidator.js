const { isPositiveInteger } = require('./commonValidator');
const validateReview = (req) => {
  const errors = [];
  const { bookingId, rating, comment } = req.body;
  if (req.method === 'POST' && !isPositiveInteger(bookingId)) errors.push({ field: 'bookingId', message: 'Đơn đặt chỗ không hợp lệ' });
  if ((req.method === 'POST' || rating !== undefined) && (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
    errors.push({ field: 'rating', message: 'Điểm đánh giá phải là số nguyên từ 1 đến 5' });
  }
  if (comment !== undefined && comment !== null && (typeof comment !== 'string' || comment.length > 2000)) {
    errors.push({ field: 'comment', message: 'Nội dung đánh giá tối đa 2000 ký tự' });
  }
  return errors;
};
module.exports = { validateReview };

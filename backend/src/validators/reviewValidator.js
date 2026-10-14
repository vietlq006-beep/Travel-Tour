const { isPositiveInteger, isValidDate } = require('./commonValidator');
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

const validateReviewQuery = (req) => {
  const errors = [];
  if (req.query.rating !== undefined
    && (!Number.isInteger(Number(req.query.rating)) || Number(req.query.rating) < 1 || Number(req.query.rating) > 5)) {
    errors.push({ field: 'rating', message: 'Điểm đánh giá phải là số nguyên từ 1 đến 5' });
  }
  if (req.query.tourId !== undefined && !isPositiveInteger(req.query.tourId)) {
    errors.push({ field: 'tourId', message: 'Mã tour không hợp lệ' });
  }
  if (req.query.keyword !== undefined
    && (typeof req.query.keyword !== 'string' || req.query.keyword.trim().length > 100)) {
    errors.push({ field: 'keyword', message: 'Từ khóa không hợp lệ' });
  }
  if (req.query.fromDate && !isValidDate(req.query.fromDate)) errors.push({ field: 'fromDate', message: 'Ngày bắt đầu không hợp lệ' });
  if (req.query.toDate && !isValidDate(req.query.toDate)) errors.push({ field: 'toDate', message: 'Ngày kết thúc không hợp lệ' });
  if (req.query.fromDate && req.query.toDate && new Date(req.query.fromDate) > new Date(req.query.toDate)) {
    errors.push({ field: 'toDate', message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi' });
  }
  if (req.query.sort && !['newest', 'oldest', 'rating_desc', 'rating_asc'].includes(req.query.sort)) {
    errors.push({ field: 'sort', message: 'Cách sắp xếp không hợp lệ' });
  }
  return errors;
};

module.exports = { validateReview, validateReviewQuery };

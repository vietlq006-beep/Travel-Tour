const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/paymentMethod');
const { isPositiveInteger } = require('./commonValidator');

const validateCreatePayment = (req) => {
  const errors = [];
  if (!isPositiveInteger(req.body.bookingId)) errors.push({ field: 'bookingId', message: 'Đơn đặt chỗ không hợp lệ' });
  if (!Object.values(PAYMENT_METHOD).includes(req.body.paymentMethod)) errors.push({ field: 'paymentMethod', message: 'Phương thức thanh toán không hợp lệ' });
  return errors;
};
const validatePaymentStatus = (req) => {
  const errors = [];
  if (!Object.values(PAYMENT_STATUS).includes(req.body.status)) {
    errors.push({ field: 'status', message: 'Trạng thái thanh toán không hợp lệ' });
  }
  if (req.body.status === PAYMENT_STATUS.FAILED) {
    if (typeof req.body.rejectionReason !== 'string' || req.body.rejectionReason.trim().length < 5) {
      errors.push({ field: 'rejectionReason', message: 'Lý do từ chối phải có ít nhất 5 ký tự' });
    } else if (req.body.rejectionReason.trim().length > 500) {
      errors.push({ field: 'rejectionReason', message: 'Lý do từ chối không được vượt quá 500 ký tự' });
    }
  }
  return errors;
};

const validatePaymentQuery = (req) => {
  const errors = [];
  if (req.query.status && !Object.values(PAYMENT_STATUS).includes(req.query.status)) errors.push({ field: 'status', message: 'Trạng thái thanh toán không hợp lệ' });
  if (req.query.paymentMethod && !Object.values(PAYMENT_METHOD).includes(req.query.paymentMethod)) errors.push({ field: 'paymentMethod', message: 'Phương thức thanh toán không hợp lệ' });
  return errors;
};

module.exports = { validateCreatePayment, validatePaymentStatus, validatePaymentQuery };

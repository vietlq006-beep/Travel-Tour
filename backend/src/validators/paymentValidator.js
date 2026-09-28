const { PAYMENT_METHOD, PAYMENT_STATUS } = require('../constants/paymentMethod');
const { isPositiveInteger } = require('./commonValidator');

const validateCreatePayment = (req) => {
  const errors = [];
  if (!isPositiveInteger(req.body.bookingId)) errors.push({ field: 'bookingId', message: 'Đơn đặt chỗ không hợp lệ' });
  if (!Object.values(PAYMENT_METHOD).includes(req.body.paymentMethod)) errors.push({ field: 'paymentMethod', message: 'Phương thức thanh toán không hợp lệ' });
  return errors;
};
const validatePaymentStatus = (req) => Object.values(PAYMENT_STATUS).includes(req.body.status)
  ? [] : [{ field: 'status', message: 'Trạng thái thanh toán không hợp lệ' }];

module.exports = { validateCreatePayment, validatePaymentStatus };

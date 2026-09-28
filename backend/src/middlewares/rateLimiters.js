const { rateLimit } = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

const createLimiter = (windowMs, limit, message) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req, res) => ApiResponse.error(res, message, [], 429)
});

const authLimiter = createLimiter(15 * 60 * 1000, 20, 'Bạn thao tác xác thực quá nhiều lần. Vui lòng thử lại sau.');
const paymentCallbackLimiter = createLimiter(60 * 1000, 120, 'Quá nhiều yêu cầu callback thanh toán.');

module.exports = { authLimiter, paymentCallbackLimiter };

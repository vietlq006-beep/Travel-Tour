const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware bọc hàm kiểm tra dữ liệu (Validator Function)
 * @param {Function} validatorFn - Hàm nhận req.body/params/query và trả về mảng errors nếu có
 */
const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req);
    if (errors && errors.length > 0) {
      return ApiResponse.error(res, 'Dữ liệu đầu vào không hợp lệ', errors, 422);
    }
    next();
  };
};

module.exports = validateRequest;

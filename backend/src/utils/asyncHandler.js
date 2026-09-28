/**
 * Bọc controller bất đồng bộ để mọi lỗi Promise đều đi qua Global Error Handler.
 * Nhờ đó controller chỉ tập trung vào nghiệp vụ và không lặp try/catch.
 */
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;

const service = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  create: async (req, res) => ApiResponse.created(res, 'Khởi tạo thanh toán thành công', await service.create(req.body, req.user)),
  listByBooking: async (req, res) => ApiResponse.success(res, 'Lấy lịch sử thanh toán thành công', await service.listByBooking(req.params.bookingId, req.user)),
  updateStatus: async (req, res) => ApiResponse.success(res, 'Cập nhật giao dịch thành công', await service.updateStatus(req.params.id, req.body.status, { transactionId: req.body.transactionId, responseData: req.body.responseData }))
};

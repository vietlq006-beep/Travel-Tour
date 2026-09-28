const service = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  create: async (req, res) => ApiResponse.created(res, 'Khởi tạo thanh toán thành công', await service.create(req.body, req.user, req.ip)),
  listByBooking: async (req, res) => ApiResponse.success(res, 'Lấy lịch sử thanh toán thành công', await service.listByBooking(req.params.bookingId, req.user)),
  updateStatus: async (req, res) => ApiResponse.success(res, 'Cập nhật giao dịch thành công', await service.updateStatus(req.params.id, req.body.status, { transactionId: req.body.transactionId, responseData: req.body.responseData })),
  vnpayIpn: async (req, res) => {
    const result = await service.handleVnPayCallback(req.query);
    return res.status(200).json({ RspCode: result.rspCode, Message: result.message });
  },
  vnpayReturn: async (req, res) => {
    const result = await service.handleVnPayCallback(req.query);
    return ApiResponse.success(res, result.message, result);
  }
};

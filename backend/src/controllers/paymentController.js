const service = require('../services/paymentService');
const statementImportService = require('../services/statementImportService');
const paymentWebhookService = require('../services/paymentWebhookService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  webhook: async (req, res) => {
    const event = paymentWebhookService.verify(req);
    const result = await service.reconcileOne(event, event.source);
    return ApiResponse.success(res, result.duplicate ? 'Sự kiện đã được xử lý trước đó' : 'Đã tiếp nhận giao dịch', result);
  },
  create: async (req, res) => ApiResponse.created(res, 'Khởi tạo thanh toán thành công', await service.create(req.body, req.user)),
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách giao dịch thành công', await service.list(req.query)),
  listByBooking: async (req, res) => ApiResponse.success(res, 'Lấy lịch sử thanh toán thành công', await service.listByBooking(req.params.bookingId, req.user)),
  updateStatus: async (req, res) => ApiResponse.success(res, 'Cập nhật giao dịch thành công', await service.updateStatus(req.params.id, req.body.status, {
    transactionId: req.body.transactionId,
    responseData: req.body.responseData,
    rejectionReason: req.body.rejectionReason,
    actor: req.user,
    note: req.body.note
  })),
  uploadProof: async (req, res) => ApiResponse.success(res, 'Đã tải chứng từ thanh toán', await service.uploadProof(
    req.params.id,
    req.file ? `/uploads/${req.file.filename}` : null,
    req.user
  )),
  importStatement: async (req, res) => {
    const rows = await statementImportService.parseStatement(req.file);
    return ApiResponse.success(res, 'Đã đối soát sao kê', await service.reconcileMany(rows, 'STATEMENT_IMPORT', req.user));
  }
};

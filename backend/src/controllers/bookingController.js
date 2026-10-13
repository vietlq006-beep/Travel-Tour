const service = require('../services/bookingService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách đặt chỗ thành công', await service.list(req.query, req.user)),
  get: async (req, res) => ApiResponse.success(res, 'Lấy chi tiết đặt chỗ thành công', await service.getById(req.params.id, req.user)),
  ticket: async (req, res) => ApiResponse.success(res, 'Lấy vé check-in thành công', await service.getTicket(req.params.id, req.user)),
  create: async (req, res) => ApiResponse.created(res, 'Đặt chỗ thành công', await service.create(req.user.id, req.body)),
  cancel: async (req, res) => ApiResponse.success(res, 'Hủy đặt chỗ thành công', await service.cancel(req.params.id, req.user, req.body.reason)),
  changeStatus: async (req, res) => ApiResponse.success(res, 'Cập nhật trạng thái đặt chỗ thành công', await service.changeStatus(
    req.params.id, req.body.status, req.user, { note: req.body.note, reason: req.body.reason }
  )),
  addNote: async (req, res) => ApiResponse.created(res, 'Đã thêm ghi chú nội bộ', await service.addNote(req.params.id, req.body.note, req.user)),
  checkIn: async (req, res) => ApiResponse.success(res, 'Check-in thành công', await service.checkIn(req.body.code, req.user)),
  createChangeRequest: async (req, res) => ApiResponse.created(res, 'Đã gửi yêu cầu', await service.createChangeRequest(req.params.id, req.body, req.user)),
  listChangeRequests: async (req, res) => ApiResponse.success(res, 'Lấy danh sách yêu cầu thành công', await service.listChangeRequests(req.query, req.user)),
  reviewChangeRequest: async (req, res) => ApiResponse.success(res, 'Đã xử lý yêu cầu', await service.reviewChangeRequest(req.params.id, req.body, req.user))
};

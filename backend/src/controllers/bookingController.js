const service = require('../services/bookingService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách đặt chỗ thành công', await service.list(req.query, req.user)),
  get: async (req, res) => ApiResponse.success(res, 'Lấy chi tiết đặt chỗ thành công', await service.getById(req.params.id, req.user)),
  create: async (req, res) => ApiResponse.created(res, 'Đặt chỗ thành công', await service.create(req.user.id, req.body)),
  cancel: async (req, res) => ApiResponse.success(res, 'Hủy đặt chỗ thành công', await service.cancel(req.params.id, req.user)),
  changeStatus: async (req, res) => ApiResponse.success(res, 'Cập nhật trạng thái đặt chỗ thành công', await service.changeStatus(req.params.id, req.body.status, req.user))
};

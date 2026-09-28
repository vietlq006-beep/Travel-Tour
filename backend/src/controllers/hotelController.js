const service = require('../services/hotelService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách khách sạn thành công', await service.list(req.query)),
  get: async (req, res) => ApiResponse.success(res, 'Lấy khách sạn thành công', await service.get(req.params.id)),
  create: async (req, res) => ApiResponse.created(res, 'Tạo khách sạn thành công', await service.create(req.body)),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật khách sạn thành công', await service.update(req.params.id, req.body)),
  remove: async (req, res) => { await service.remove(req.params.id); return ApiResponse.success(res, 'Xóa khách sạn thành công'); }
};

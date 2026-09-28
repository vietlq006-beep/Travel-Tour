const service = require('../services/tourGuideService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách hướng dẫn viên thành công', await service.list(req.query)),
  get: async (req, res) => ApiResponse.success(res, 'Lấy hướng dẫn viên thành công', await service.get(req.params.id)),
  create: async (req, res) => ApiResponse.created(res, 'Tạo hướng dẫn viên thành công', await service.create(req.body)),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật hướng dẫn viên thành công', await service.update(req.params.id, req.body)),
  remove: async (req, res) => { await service.remove(req.params.id); return ApiResponse.success(res, 'Xóa hướng dẫn viên thành công'); }
};

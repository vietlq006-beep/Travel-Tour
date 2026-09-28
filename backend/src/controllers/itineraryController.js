const service = require('../services/itineraryService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy lịch trình thành công', await service.list(req.params.tourId)),
  create: async (req, res) => ApiResponse.created(res, 'Tạo ngày lịch trình thành công', await service.create(req.params.tourId, req.body)),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật lịch trình thành công', await service.update(req.params.tourId, req.params.id, req.body)),
  remove: async (req, res) => { await service.remove(req.params.tourId, req.params.id); return ApiResponse.success(res, 'Xóa ngày lịch trình thành công'); },
  replaceAll: async (req, res) => ApiResponse.success(res, 'Thay thế lịch trình thành công', await service.replaceAll(req.params.tourId, req.body.items))
};

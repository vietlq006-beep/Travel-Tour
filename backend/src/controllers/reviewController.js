const service = require('../services/reviewService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  listByTour: async (req, res) => ApiResponse.success(res, 'Lấy đánh giá tour thành công', await service.listByTour(req.params.tourId, req.query)),
  create: async (req, res) => ApiResponse.created(res, 'Gửi đánh giá thành công', await service.create(req.user.id, req.body)),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật đánh giá thành công', await service.update(req.params.id, req.body, req.user)),
  remove: async (req, res) => { await service.remove(req.params.id, req.user); return ApiResponse.success(res, 'Xóa đánh giá thành công'); }
};

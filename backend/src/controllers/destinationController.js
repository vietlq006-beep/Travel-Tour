const service = require('../services/destinationService');
const ApiResponse = require('../utils/apiResponse');
const { toUploadUrl } = require('../middlewares/uploadMiddleware');

module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách điểm đến thành công', await service.list(req.query)),
  getById: async (req, res) => ApiResponse.success(res, 'Lấy chi tiết điểm đến thành công', await service.getById(req.params.id)),
  create: async (req, res) => ApiResponse.created(res, 'Tạo điểm đến thành công', await service.create({
    ...req.body,
    imageUrl: toUploadUrl(req.file) || req.body.imageUrl
  })),
  update: async (req, res) => {
    const data = { ...req.body };
    if (req.file) data.imageUrl = toUploadUrl(req.file);
    return ApiResponse.success(res, 'Cập nhật điểm đến thành công', await service.update(req.params.id, data));
  },
  remove: async (req, res) => {
    await service.remove(req.params.id);
    return ApiResponse.success(res, 'Xóa điểm đến thành công');
  }
};

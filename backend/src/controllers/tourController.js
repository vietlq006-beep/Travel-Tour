const service = require('../services/tourService');
const ApiResponse = require('../utils/apiResponse');
const { toUploadUrl } = require('../middlewares/uploadMiddleware');

const buildPayload = (req) => {
  const data = { ...req.body };
  const thumbnail = req.files?.thumbnail?.[0];
  const images = req.files?.images || [];
  if (thumbnail) data.thumbnail = toUploadUrl(thumbnail);
  if (images.length) data.images = images.map(toUploadUrl);
  ['categoryId', 'durationDays', 'durationNights'].forEach((field) => {
    if (data[field] !== undefined) data[field] = Number(data[field]);
  });
  if (data.isActive !== undefined) data.isActive = data.isActive === true || data.isActive === 'true';
  return data;
};

module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách tour thành công', await service.list(req.query, req.user?.role === 'ADMIN')),
  getById: async (req, res) => ApiResponse.success(res, 'Lấy chi tiết tour thành công', await service.getById(req.params.id, req.user?.role === 'ADMIN')),
  create: async (req, res) => ApiResponse.created(res, 'Tạo tour thành công', await service.create(buildPayload(req))),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật tour thành công', await service.update(req.params.id, buildPayload(req))),
  remove: async (req, res) => {
    const result = await service.remove(req.params.id);
    return ApiResponse.success(res, result.deactivated ? 'Tour đã có lịch sử nên được chuyển sang ngừng hoạt động' : 'Xóa tour thành công');
  }
};

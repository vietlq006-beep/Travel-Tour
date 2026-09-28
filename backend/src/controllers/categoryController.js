const categoryService = require('../services/categoryService');
const ApiResponse = require('../utils/apiResponse');
const { toUploadUrl } = require('../middlewares/uploadMiddleware');

class CategoryController {
  async list(req, res) {
    return ApiResponse.success(res, 'Lấy danh sách danh mục thành công', await categoryService.list(req.query));
  }
  async getById(req, res) {
    return ApiResponse.success(res, 'Lấy chi tiết danh mục thành công', await categoryService.getById(req.params.id));
  }
  async create(req, res) {
    const data = { ...req.body, imageUrl: toUploadUrl(req.file) || req.body.imageUrl };
    return ApiResponse.created(res, 'Tạo danh mục thành công', await categoryService.create(data));
  }
  async update(req, res) {
    const data = { ...req.body };
    if (req.file) data.imageUrl = toUploadUrl(req.file);
    return ApiResponse.success(res, 'Cập nhật danh mục thành công', await categoryService.update(req.params.id, data));
  }
  async remove(req, res) {
    await categoryService.remove(req.params.id);
    return ApiResponse.success(res, 'Xóa danh mục thành công');
  }
}

module.exports = new CategoryController();

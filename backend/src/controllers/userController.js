const service = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách người dùng thành công', await service.list(req.query)),
  get: async (req, res) => ApiResponse.success(res, 'Lấy chi tiết người dùng thành công', await service.get(req.params.id)),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật người dùng thành công', await service.update(req.params.id, req.body, req.user.id))
};

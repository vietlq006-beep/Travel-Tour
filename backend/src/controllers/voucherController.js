const service = require('../services/voucherService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách voucher thành công', await service.list(req.query)),
  get: async (req, res) => ApiResponse.success(res, 'Lấy voucher thành công', await service.get(req.params.id)),
  create: async (req, res) => ApiResponse.created(res, 'Tạo voucher thành công', await service.create(req.body)),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật voucher thành công', await service.update(req.params.id, req.body)),
  remove: async (req, res) => { const deactivated = await service.remove(req.params.id); return ApiResponse.success(res, deactivated ? 'Voucher đã dùng nên được chuyển sang ngừng hoạt động' : 'Xóa voucher thành công'); },
  validateCode: async (req, res) => ApiResponse.success(res, 'Voucher hợp lệ', await service.calculate(req.body.code, Number(req.body.totalAmount)))
};

const service = require('../services/departureService');
const ApiResponse = require('../utils/apiResponse');
const normalize = (body) => {
  const data = { ...body };
  ['tourId', 'capacity', 'hotelId', 'vehicleId', 'guideId', 'adultPrice', 'childPrice'].forEach((field) => {
    if (data[field] === '') data[field] = null;
    else if (data[field] !== undefined && data[field] !== null) data[field] = Number(data[field]);
  });
  return data;
};
module.exports = {
  list: async (req, res) => ApiResponse.success(res, 'Lấy danh sách đợt khởi hành thành công', await service.list(req.query, req.user?.role === 'ADMIN')),
  get: async (req, res) => ApiResponse.success(res, 'Lấy đợt khởi hành thành công', await service.get(req.params.id, req.user?.role === 'ADMIN')),
  create: async (req, res) => ApiResponse.created(res, 'Tạo đợt khởi hành thành công', await service.create(normalize(req.body))),
  update: async (req, res) => ApiResponse.success(res, 'Cập nhật đợt khởi hành thành công', await service.update(req.params.id, normalize(req.body))),
  remove: async (req, res) => { await service.remove(req.params.id); return ApiResponse.success(res, 'Xóa đợt khởi hành thành công'); }
};

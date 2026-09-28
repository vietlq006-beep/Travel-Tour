const service = require('../services/dashboardService');
const ApiResponse = require('../utils/apiResponse');
module.exports = {
  summary: async (_req, res) => ApiResponse.success(res, 'Lấy tổng quan thành công', await service.summary()),
  analytics: async (req, res) => ApiResponse.success(res, 'Lấy báo cáo phân tích thành công', await service.analytics(req.query))
};

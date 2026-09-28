/**
 * Chuẩn hóa cấu trúc phản hồi API theo quy ước kiến trúc Phase 7
 */
class ApiResponse {
  static success(res, message = 'Thành công', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, message = 'Tạo mới thành công', data = {}) {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Đã có lỗi xảy ra', errors = [], statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }
}

module.exports = ApiResponse;

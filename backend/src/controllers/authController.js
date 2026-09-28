const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.created(res, 'Đăng ký tài khoản thành công', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, 'Đăng nhập thành công', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return ApiResponse.success(res, 'Lấy thông tin người dùng thành công', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, 'Cập nhật thông tin cá nhân thành công', { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

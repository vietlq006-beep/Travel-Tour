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

  async confirmContact(req, res, next) {
    try {
      const result = await authService.confirmContact(req.user.id, req.body);
      return ApiResponse.success(res, 'Xác nhận thông tin liên hệ thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      return ApiResponse.success(res, 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.', result);
    } catch (error) { next(error); }
  }

  async resetPassword(req, res, next) {
    try {
      return ApiResponse.success(res, 'Đặt lại mật khẩu thành công.', await authService.resetPassword(req.body.token, req.body.newPassword));
    } catch (error) { next(error); }
  }

  async requestEmailVerification(req, res, next) {
    try {
      return ApiResponse.success(res, 'Đã gửi mã xác thực email.', await authService.requestEmailVerification(req.user.id));
    } catch (error) { next(error); }
  }

  async confirmEmailVerification(req, res, next) {
    try {
      return ApiResponse.success(res, 'Xác thực email thành công.', await authService.confirmEmailVerification(req.user.id, req.body.token));
    } catch (error) { next(error); }
  }

  async requestPhoneVerification(req, res, next) {
    try {
      return ApiResponse.success(res, 'Đã gửi mã xác thực số điện thoại.', await authService.requestPhoneVerification(req.user.id, req.body.phoneNumber));
    } catch (error) { next(error); }
  }

  async confirmPhoneVerification(req, res, next) {
    try {
      return ApiResponse.success(res, 'Xác thực số điện thoại thành công.', await authService.confirmPhoneVerification(req.user.id, req.body.token));
    } catch (error) { next(error); }
  }
}

module.exports = new AuthController();

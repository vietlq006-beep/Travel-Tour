/**
 * Validate dữ liệu cho chức năng Đăng ký
 */
const validateRegister = (req) => {
  const { fullName, email, password, phoneNumber } = req.body;
  const errors = [];

  if (!fullName || fullName.trim().length === 0) {
    errors.push({ field: 'fullName', message: 'Họ và tên không được để trống' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Email không hợp lệ' });
  }

  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Mật khẩu phải có tối thiểu 6 ký tự' });
  }

  if (phoneNumber && !/^[0-9+]{9,15}$/.test(phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Số điện thoại không hợp lệ' });
  }

  return errors;
};

/**
 * Validate dữ liệu cho chức năng Đăng nhập
 */
const validateLogin = (req) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email không được để trống' });
  }

  if (!password || password.trim().length === 0) {
    errors.push({ field: 'password', message: 'Mật khẩu không được để trống' });
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin
};

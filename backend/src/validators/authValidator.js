const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+]{9,15}$/;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

const validateRegister = (req) => {
  const { fullName, email, password, phoneNumber } = req.body;
  const errors = [];
  if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 100) errors.push({ field: 'fullName', message: 'Họ tên phải có từ 2 đến 100 ký tự' });
  if (!email || !emailPattern.test(email.trim())) errors.push({ field: 'email', message: 'Email không hợp lệ' });
  if (!password || !strongPassword.test(password)) errors.push({ field: 'password', message: 'Mật khẩu 8-72 ký tự, có chữ hoa, chữ thường và chữ số' });
  if (phoneNumber && !phonePattern.test(phoneNumber)) errors.push({ field: 'phoneNumber', message: 'Số điện thoại không hợp lệ' });
  return errors;
};

const validateLogin = (req) => {
  const errors = [];
  if (!req.body.email || !emailPattern.test(req.body.email.trim())) errors.push({ field: 'email', message: 'Email không hợp lệ' });
  if (!req.body.password) errors.push({ field: 'password', message: 'Mật khẩu không được để trống' });
  return errors;
};

const validateProfile = (req) => {
  const { fullName, phoneNumber, oldPassword, newPassword } = req.body;
  const errors = [];
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100)) errors.push({ field: 'fullName', message: 'Họ tên phải có từ 2 đến 100 ký tự' });
  if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== '' && !phonePattern.test(phoneNumber)) errors.push({ field: 'phoneNumber', message: 'Số điện thoại không hợp lệ' });
  if (newPassword !== undefined && !strongPassword.test(newPassword)) errors.push({ field: 'newPassword', message: 'Mật khẩu mới 8-72 ký tự, có chữ hoa, chữ thường và chữ số' });
  if (newPassword && !oldPassword) errors.push({ field: 'oldPassword', message: 'Cần mật khẩu cũ để đổi mật khẩu' });
  if (![fullName, phoneNumber, newPassword].some((value) => value !== undefined)) errors.push({ field: 'body', message: 'Không có thông tin cần cập nhật' });
  return errors;
};

const validateForgotPassword = (req) => !req.body.email || !emailPattern.test(req.body.email.trim())
  ? [{ field: 'email', message: 'Email không hợp lệ' }] : [];

const validateResetPassword = (req) => {
  const errors = [];
  if (typeof req.body.token !== 'string' || req.body.token.length < 20) errors.push({ field: 'token', message: 'Mã đặt lại mật khẩu không hợp lệ' });
  if (!strongPassword.test(req.body.newPassword || '')) errors.push({ field: 'newPassword', message: 'Mật khẩu mới 8-72 ký tự, có chữ hoa, chữ thường và chữ số' });
  return errors;
};

const validateVerificationToken = (req) => typeof req.body.token === 'string' && req.body.token.length >= 6
  ? [] : [{ field: 'token', message: 'Mã xác thực không hợp lệ' }];

const validatePhoneVerification = (req) => phonePattern.test(req.body.phoneNumber || '')
  ? [] : [{ field: 'phoneNumber', message: 'Số điện thoại không hợp lệ' }];

const vietnamPhonePattern = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const validateContactConfirmation = (req) => {
  const errors = [];
  if (typeof req.body.email !== 'string' || !emailPattern.test(req.body.email.trim())) {
    errors.push({ field: 'email', message: 'Email không đúng định dạng' });
  }
  if (typeof req.body.phoneNumber !== 'string' || !vietnamPhonePattern.test(req.body.phoneNumber.trim())) {
    errors.push({ field: 'phoneNumber', message: 'Số điện thoại Việt Nam không đúng định dạng' });
  }
  if (typeof req.body.currentPassword !== 'string' || !req.body.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Vui lòng nhập mật khẩu để xác nhận thay đổi' });
  }
  return errors;
};

module.exports = {
  validateRegister, validateLogin, validateProfile, validateForgotPassword,
  validateResetPassword, validateVerificationToken, validatePhoneVerification,
  validateContactConfirmation
};

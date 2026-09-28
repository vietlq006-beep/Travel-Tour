const test = require('node:test');
const assert = require('node:assert/strict');
const { getPagination } = require('../../src/utils/pagination');
const { validateRegister } = require('../../src/validators/authValidator');
const { validateCreateBooking } = require('../../src/validators/bookingValidator');
const vnpay = require('../../src/services/vnpayService');

test('phân trang chặn giá trị âm và giới hạn tối đa 100', () => {
  assert.deepEqual(getPagination({ page: '-2', limit: '999' }), { page: 1, limit: 100, offset: 0 });
  assert.deepEqual(getPagination({ page: '3', limit: '20' }), { page: 3, limit: 20, offset: 40 });
});

test('đăng ký yêu cầu mật khẩu mạnh', () => {
  const errors = validateRegister({ body: { fullName: 'Nguyễn An', email: 'an@example.com', password: '12345678' } });
  assert.equal(errors.some((item) => item.field === 'password'), true);
  assert.equal(validateRegister({ body: { fullName: 'Nguyễn An', email: 'an@example.com', password: 'Password1' } }).length, 0);
});

test('đặt chỗ yêu cầu danh sách hành khách khớp số lượng', () => {
  const errors = validateCreateBooking({ body: { departureId: 1, numAdults: 2, numChildren: 0, participants: [] } });
  assert.equal(errors.some((item) => item.field === 'participants'), true);
});

test('VNPAY xác minh đúng chữ ký và phát hiện tham số bị sửa', () => {
  process.env.VNP_TMN_CODE = 'TESTCODE';
  process.env.VNP_HASH_SECRET = '0123456789abcdefghijklmnopqrstuvwxyz';
  process.env.VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  process.env.VNP_RETURN_URL = 'http://localhost:5000/api/payments/vnpay/return';
  const url = new URL(vnpay.createPaymentUrl({ paymentId: 99, amount: 1250000, ipAddress: '127.0.0.1' }));
  const params = Object.fromEntries(url.searchParams.entries());
  assert.equal(vnpay.verifyCallback(params).valid, true);
  params.vnp_Amount = '1';
  assert.equal(vnpay.verifyCallback(params).valid, false);
});

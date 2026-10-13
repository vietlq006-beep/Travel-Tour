const test = require('node:test');
const assert = require('node:assert/strict');
const { getPagination } = require('../../src/utils/pagination');
const { validateRegister } = require('../../src/validators/authValidator');
const { validateCreateBooking } = require('../../src/validators/bookingValidator');
const { isSupportedVideoUrl } = require('../../src/validators/tourValidator');
const { createVietQrData, compactTransferContent } = require('../../src/services/vietQrService');
const { tours: seededTours, destinations: seededDestinations } = require('../../src/database/seeders/travelCatalog');

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

test('tour chỉ nhận video YouTube qua HTTPS', () => {
  assert.equal(isSupportedVideoUrl('https://www.youtube.com/watch?v=YHBqLih80uw'), true);
  assert.equal(isSupportedVideoUrl('https://youtu.be/YHBqLih80uw'), true);
  assert.equal(isSupportedVideoUrl('http://youtube.com/watch?v=YHBqLih80uw'), false);
  assert.equal(isSupportedVideoUrl('https://example.com/video.mp4'), false);
});

test('catalog seed có đúng 30 tour hoàn chỉnh và mã không trùng', () => {
  assert.equal(seededTours.length, 30);
  assert.equal(seededDestinations.length, 24);
  assert.equal(new Set(seededTours.map((tour) => tour.code)).size, seededTours.length);

  for (const tour of seededTours) {
    assert.equal(tour.itineraries.length, tour.durationDays, tour.code);
    assert.ok(tour.images.length >= 3, tour.code);
    assert.ok(tour.destinations.length >= 1, tour.code);
    assert.ok(tour.adultPrice > tour.childPrice && tour.childPrice > 0, tour.code);
    assert.equal(isSupportedVideoUrl(tour.videoUrl), true, tour.code);
  }
});

test('VietQR tạo đúng tài khoản, số tiền và nội dung đối soát', () => {
  const data = createVietQrData(
    { bookingCode: 'LVT-20261013-ABCDEF12' },
    { amount: '1250000.00' }
  );
  const url = new URL(data.qrImageUrl);
  assert.equal(data.bankId, '970407');
  assert.equal(data.accountNo, '9330302005');
  assert.equal(data.accountName, 'Lê Quốc Việt');
  assert.equal(data.amount, 1250000);
  assert.equal(data.transferContent, compactTransferContent('LVT-20261013-ABCDEF12'));
  assert.equal(url.hostname, 'img.vietqr.io');
  assert.equal(url.pathname, '/image/970407-9330302005-print.png');
  assert.equal(url.searchParams.get('amount'), '1250000');
  assert.equal(url.searchParams.get('addInfo'), data.transferContent);
});

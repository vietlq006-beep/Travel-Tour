const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, db, login, auth, closeDatabase } = require('../helpers');

const marker = `FLOW-${Date.now()}`;
let adminToken; let customerToken;
let categoryId; let destinationId; let tourId; let departureId; let voucherId; let bookingId; let paymentId;
let rejectedBookingId; let rejectedPaymentId;

before(async () => {
  adminToken = await login();
  customerToken = await login('khachhang@gmail.com', 'Customer@123');
  categoryId = (await api.post('/api/categories').set(auth(adminToken)).send({ name: `Danh mục ${marker}` })).body.data.id;
  destinationId = (await api.post('/api/destinations').set(auth(adminToken)).send({ name: `Điểm ${marker}`, region: 'NAM' })).body.data.id;
  tourId = (await api.post('/api/tours').set(auth(adminToken)).send({
    categoryId, destinationIds: [destinationId], code: marker, name: `Tour ${marker}`,
    durationDays: 2, durationNights: 1, thumbnail: 'https://example.com/flow.jpg'
  })).body.data.id;
  const start = new Date(Date.now() + 40 * 86400000);
  const end = new Date(start.getTime() + 86400000);
  departureId = (await api.post('/api/departures').set(auth(adminToken)).send({
    tourId, startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10),
    capacity: 5, adultPrice: 2000000, childPrice: 1000000
  })).body.data.id;
  voucherId = (await api.post('/api/vouchers').set(auth(adminToken)).send({
    code: marker, discountType: 'PERCENT', discountValue: 10, minBookingAmount: 0, maxUsage: 10,
    startDate: new Date(Date.now() - 86400000).toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString()
  })).body.data.id;
});

after(async () => {
  if (rejectedPaymentId) await db.Payment.destroy({ where: { id: rejectedPaymentId } });
  if (rejectedBookingId) await db.Booking.destroy({ where: { id: rejectedBookingId } });
  if (paymentId) await db.Payment.destroy({ where: { id: paymentId } });
  if (bookingId) await db.Booking.destroy({ where: { id: bookingId } });
  if (departureId) await db.TourDeparture.destroy({ where: { id: departureId }, force: true });
  if (tourId) await db.Tour.destroy({ where: { id: tourId }, force: true });
  if (destinationId) await db.Destination.destroy({ where: { id: destinationId }, force: true });
  if (categoryId) await db.Category.destroy({ where: { id: categoryId }, force: true });
  if (voucherId) await db.Voucher.destroy({ where: { id: voucherId } });
  await closeDatabase();
});

test('khách đặt chỗ và hệ thống tính giá voucher phía máy chủ', async () => {
  const response = await api.post('/api/bookings').set(auth(customerToken)).send({
    departureId, voucherCode: marker, numAdults: 1, numChildren: 1,
    participants: [
      { fullName: 'Nguyễn Người Lớn', gender: 'MALE', dateOfBirth: '1990-01-01', passengerType: 'ADULT' },
      { fullName: 'Nguyễn Trẻ Em', gender: 'FEMALE', dateOfBirth: '2018-01-01', passengerType: 'CHILD' }
    ]
  }).expect(201);
  bookingId = response.body.data.id;
  assert.equal(Number(response.body.data.totalAmount), 3000000);
  assert.equal(Number(response.body.data.discountAmount), 300000);
  assert.equal(Number(response.body.data.finalAmount), 2700000);
  assert.equal((await db.TourDeparture.findByPk(departureId)).bookedSeats, 2);
});

test('thanh toán thành công tự xác nhận đơn', async () => {
  const created = await api.post('/api/payments').set(auth(customerToken)).send({ bookingId, paymentMethod: 'VIETQR' }).expect(201);
  paymentId = created.body.data.payment.id;
  assert.equal(created.body.data.vietQr.accountNo, '9330302005');
  assert.equal(created.body.data.vietQr.accountName, 'Lê Quốc Việt');
  assert.equal(created.body.data.vietQr.amount, 2700000);
  assert.match(created.body.data.vietQr.qrImageUrl, /^https:\/\/img\.vietqr\.io\/image\/970407-9330302005-print\.png\?/);
  const reopened = await api.post('/api/payments').set(auth(customerToken)).send({ bookingId, paymentMethod: 'VIETQR' }).expect(201);
  assert.equal(reopened.body.data.payment.id, paymentId);
  await api.patch(`/api/payments/${paymentId}/status`).set(auth(adminToken)).send({ status: 'SUCCESS', transactionId: marker }).expect(200);
  assert.equal((await db.Booking.findByPk(bookingId)).status, 'CONFIRMED');
});

test('không hủy đơn đã thanh toán trước khi hoàn tiền', async () => {
  await api.post(`/api/bookings/${bookingId}/cancel`).set(auth(customerToken)).expect(409);
  await api.patch(`/api/bookings/${bookingId}/status`).set(auth(adminToken)).send({ status: 'CANCELLED' }).expect(409);
});

test('hoàn tiền rồi hủy đơn sẽ trả lại ghế và lượt voucher', async () => {
  await api.patch(`/api/payments/${paymentId}/status`).set(auth(adminToken)).send({ status: 'REFUNDED' }).expect(200);
  await api.patch(`/api/bookings/${bookingId}/status`).set(auth(adminToken)).send({ status: 'CANCELLED' }).expect(200);
  assert.equal((await db.TourDeparture.findByPk(departureId)).bookedSeats, 0);
  assert.equal((await db.Voucher.findByPk(voucherId)).usedCount, 0);
});

test('giao dịch VietQR bị từ chối phải có lý do và xuất hiện trong danh sách riêng', async () => {
  const bookingResponse = await api.post('/api/bookings').set(auth(customerToken)).send({
    departureId, numAdults: 1, numChildren: 0,
    participants: [
      { fullName: 'Khách Bị Từ Chối', gender: 'MALE', dateOfBirth: '1992-02-02', passengerType: 'ADULT' }
    ]
  }).expect(201);
  rejectedBookingId = bookingResponse.body.data.id;
  const paymentResponse = await api.post('/api/payments').set(auth(customerToken)).send({
    bookingId: rejectedBookingId,
    paymentMethod: 'VIETQR'
  }).expect(201);
  rejectedPaymentId = paymentResponse.body.data.payment.id;

  await api.patch(`/api/payments/${rejectedPaymentId}/status`).set(auth(adminToken)).send({ status: 'FAILED' }).expect(422);
  const rejectionReason = 'Không tìm thấy giao dịch tương ứng trên sao kê ngân hàng.';
  const rejected = await api.patch(`/api/payments/${rejectedPaymentId}/status`).set(auth(adminToken)).send({
    status: 'FAILED',
    rejectionReason
  }).expect(200);
  assert.equal(rejected.body.data.responseData.rejectionReason, rejectionReason);
  assert.ok(rejected.body.data.responseData.rejectedAt);

  const rejectedList = await api.get('/api/payments').set(auth(adminToken)).query({
    status: 'FAILED', paymentMethod: 'VIETQR', page: 1, limit: 100
  }).expect(200);
  const listedPayment = rejectedList.body.data.items.find((item) => item.id === rejectedPaymentId);
  assert.equal(listedPayment.responseData.rejectionReason, rejectionReason);
  assert.equal(listedPayment.booking.departure.tour.id, tourId);

  const pendingList = await api.get('/api/payments').set(auth(adminToken)).query({
    status: 'PENDING', paymentMethod: 'VIETQR', page: 1, limit: 100
  }).expect(200);
  assert.equal(pendingList.body.data.items.some((item) => item.id === rejectedPaymentId), false);
});

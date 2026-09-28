const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, db, login, auth, closeDatabase } = require('../helpers');

const marker = `TEST-${Date.now()}`;
let token; let categoryId; let destinationId; let tourId; let departureId; let hotelId; let vehicleId; let guideId;

before(async () => { token = await login(); });
after(async () => {
  if (departureId) await db.TourDeparture.destroy({ where: { id: departureId }, force: true });
  if (tourId) await db.Tour.destroy({ where: { id: tourId }, force: true });
  if (destinationId) await db.Destination.destroy({ where: { id: destinationId }, force: true });
  if (categoryId) await db.Category.destroy({ where: { id: categoryId }, force: true });
  if (hotelId) await db.Hotel.destroy({ where: { id: hotelId } });
  if (vehicleId) await db.Vehicle.destroy({ where: { id: vehicleId } });
  if (guideId) await db.TourGuide.destroy({ where: { id: guideId } });
  await closeDatabase();
});

test('khách không thể tạo danh mục quản trị', async () => {
  await api.post('/api/categories').send({ name: marker }).expect(401);
});

test('admin tạo dữ liệu nền và tour liên kết điểm đến', async () => {
  categoryId = (await api.post('/api/categories').set(auth(token)).send({ name: `Danh mục ${marker}` }).expect(201)).body.data.id;
  destinationId = (await api.post('/api/destinations').set(auth(token)).send({ name: `Điểm đến ${marker}`, region: 'TRUNG' }).expect(201)).body.data.id;
  hotelId = (await api.post('/api/hotels').set(auth(token)).send({ name: `Khách sạn ${marker}`, starRating: 4, address: 'Đà Nẵng' }).expect(201)).body.data.id;
  vehicleId = (await api.post('/api/vehicles').set(auth(token)).send({ vehicleType: 'Xe 16 chỗ', licensePlate: `T${Date.now()}`.slice(-10), seatCapacity: 16 }).expect(201)).body.data.id;
  guideId = (await api.post('/api/tour-guides').set(auth(token)).send({ fullName: `HDV ${marker}`, phoneNumber: '0901234567', experienceYears: 3 }).expect(201)).body.data.id;
  const tour = await api.post('/api/tours').set(auth(token)).send({
    categoryId, code: marker, name: `Tour ${marker}`, durationDays: 3, durationNights: 2,
    thumbnail: 'https://example.com/tour.jpg', destinationIds: [destinationId]
  }).expect(201);
  tourId = tour.body.data.id;
  assert.equal(tour.body.data.destinations[0].id, destinationId);
});

test('admin cấu hình lịch trình và đợt khởi hành', async () => {
  await api.post(`/api/tours/${tourId}/itineraries`).set(auth(token)).send({ dayNumber: 1, title: 'Khởi hành', description: 'Tập trung và khởi hành' }).expect(201);
  const start = new Date(Date.now() + 30 * 86400000);
  const end = new Date(start.getTime() + 2 * 86400000);
  const response = await api.post('/api/departures').set(auth(token)).send({
    tourId, startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10),
    capacity: 16, adultPrice: 3000000, childPrice: 1500000, hotelId, vehicleId, guideId
  }).expect(201);
  departureId = response.body.data.id;
  assert.equal(response.body.data.remainingSeats, 16);
});

test('tra cứu công khai trả đúng tour vừa tạo', async () => {
  const response = await api.get(`/api/tours/${tourId}`).expect(200);
  assert.equal(response.body.data.code, marker);
  assert.equal(response.body.data.itineraries.length, 1);
  assert.equal(response.body.data.departures.length, 1);
});

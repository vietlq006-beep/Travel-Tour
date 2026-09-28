const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, closeDatabase } = require('../helpers');

after(closeDatabase);

test('health check trả trạng thái hoạt động và request id', async () => {
  const response = await api.get('/api/health').expect(200);
  assert.equal(response.body.success, true);
  assert.ok(response.headers['x-request-id']);
});

test('đăng ký sai dữ liệu trả danh sách lỗi 422', async () => {
  const response = await api.post('/api/auth/register').send({ fullName: '', email: 'sai', password: '123' }).expect(422);
  assert.equal(response.body.success, false);
  assert.ok(response.body.errors.length >= 3);
});

test('admin đăng nhập được và không lộ mật khẩu', async () => {
  const response = await api.post('/api/auth/login').send({ email: 'ADMIN@LEVIET.COM', password: 'Admin@123' }).expect(200);
  assert.equal(response.body.data.user.role, 'ADMIN');
  assert.equal(response.body.data.user.password, undefined);
  assert.ok(response.body.data.token);
});

test('khách vãng lai xem được danh mục có phân trang', async () => {
  const response = await api.get('/api/categories?page=1&limit=2').expect(200);
  assert.equal(Array.isArray(response.body.data.items), true);
  assert.equal(response.body.data.pagination.limit, 2);
});

test('đường dẫn không tồn tại trả 404 thống nhất', async () => {
  const response = await api.get('/api/khong-ton-tai').expect(404);
  assert.equal(response.body.success, false);
});

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, login, auth, closeDatabase } = require('../helpers');

let token;
before(async () => { token = await login(); });
after(closeDatabase);

test('dashboard trả số liệu tổng quan cho admin', async () => {
  const response = await api.get('/api/dashboard/summary').set(auth(token)).expect(200);
  assert.equal(typeof response.body.data.customers, 'number');
  assert.equal(typeof response.body.data.revenue, 'number');
});

test('dashboard từ chối khoảng ngày đảo ngược', async () => {
  const response = await api.get('/api/dashboard/analytics?fromDate=2026-12-31&toDate=2026-01-01').set(auth(token)).expect(422);
  assert.equal(response.body.errors[0].field, 'toDate');
});

test('báo cáo booking trả tệp Excel hợp lệ', async () => {
  const response = await api.get('/api/reports/bookings.xlsx').set(auth(token)).buffer(true).parse((res, callback) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => callback(null, Buffer.concat(chunks)));
  }).expect(200);
  assert.match(response.headers['content-type'], /spreadsheetml/);
  assert.equal(response.body.subarray(0, 2).toString(), 'PK');
});

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { api, auth, db, login, closeDatabase } = require('../helpers');

after(closeDatabase);

test('admin quản lý khách hàng và khách không thể truy cập API quản trị', async (context) => {
  const marker = Date.now();
  const email = `customer-admin-test-${marker}@example.com`;
  const password = 'Customer@123';
  const registerResponse = await api.post('/api/auth/register').send({
    fullName: 'Khách hàng kiểm thử',
    email,
    phoneNumber: '0901234567',
    password
  }).expect(201);
  const customerToken = registerResponse.body.data.token;
  const customerId = registerResponse.body.data.user.id;
  context.after(() => db.User.destroy({ where: { id: customerId }, force: true }));

  await api.get('/api/users').set(auth(customerToken)).expect(403);

  const adminToken = await login();
  const listResponse = await api.get('/api/users')
    .set(auth(adminToken))
    .query({ role: 'CUSTOMER', keyword: email, page: 1, limit: 10 })
    .expect(200);
  assert.equal(listResponse.body.data.items.length, 1);
  assert.equal(listResponse.body.data.items[0].email, email);
  assert.equal(Object.hasOwn(listResponse.body.data.items[0], 'password'), false);

  const detailResponse = await api.get(`/api/users/${customerId}`).set(auth(adminToken)).expect(200);
  assert.deepEqual(detailResponse.body.data.bookings, []);

  await api.patch(`/api/users/${customerId}`).set(auth(adminToken)).send({ isActive: false }).expect(200);
  await api.post('/api/auth/login').send({ email, password }).expect(403);
  const restoreResponse = await api.patch(`/api/users/${customerId}`).set(auth(adminToken)).send({ isActive: true }).expect(200);
  assert.equal(restoreResponse.body.data.isActive, true);
});

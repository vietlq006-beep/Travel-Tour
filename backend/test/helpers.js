process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

const api = request(app);
const login = async (email = 'admin@leviet.com', password = 'Admin@123') => {
  const response = await api.post('/api/auth/login').send({ email, password });
  if (response.status !== 200) throw new Error(`Đăng nhập test thất bại: ${response.status} ${response.text}`);
  return response.body.data.token;
};
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const closeDatabase = () => db.sequelize.close();

module.exports = { api, db, login, auth, closeDatabase };

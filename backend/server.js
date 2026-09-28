require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { validateEnvironment } = require('./src/config/environment');
const db = require('./src/models');

const PORT = Number(process.env.PORT) || 5000;
let server;

const shutdown = async (signal) => {
  console.log(`[Server] Nhận ${signal}, đang dừng an toàn...`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await db.sequelize.close();
  process.exit(0);
};

const startServer = async () => {
  try {
    validateEnvironment();
    await testConnection();
    await db.sequelize.sync({ alter: false });
    server = app.listen(PORT, () => {
      console.log(`[Server] LeViet Travel API đang lắng nghe tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Không thể khởi động:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => {
  console.error('[Server] Promise chưa xử lý:', error);
  shutdown('unhandledRejection');
});

startServer();

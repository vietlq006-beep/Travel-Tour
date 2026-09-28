require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const db = require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Kiểm tra kết nối Database
    await testConnection();

    // 2. Đồng bộ Sequelize Model với MySQL (alter: false để bảo toàn 100% bảng đã tạo bằng DDL SQL)
    await db.sequelize.sync({ alter: false });
    console.log('✅ [Sequelize] Đồng bộ Models & Associations hoàn tất!');

    // 3. Khởi chạy HTTP Server
    app.listen(PORT, () => {
      console.log(`🚀 [Server] LeViet Travel API Server đang lắng nghe tại port: ${PORT}`);
      console.log(`📡 [Health Check] http://localhost:${PORT}/api/health`);
      console.log(`🔐 [Auth API] http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ [Server] Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

startServer();

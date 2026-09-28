const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'leviet_travel_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+07:00', // Múi giờ Việt Nam
    define: {
      timestamps: true,
      underscored: true, // snake_case cho tên cột database (created_at, updated_at)
      freezeTableName: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ [Database] Kết nối MySQL (leviet_travel_db) thành công rực rỡ!');
  } catch (error) {
    console.error('❌ [Database] Không thể kết nối tới MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection
};

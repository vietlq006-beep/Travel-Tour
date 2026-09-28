require('dotenv').config();
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

const migrations = [
  require('./migrations/001-harden-constraints')
];

const run = async () => {
  await sequelize.authenticate();
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(100) PRIMARY KEY,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  const applied = new Set((await sequelize.query('SELECT id FROM schema_migrations', { type: QueryTypes.SELECT })).map((item) => item.id));
  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      console.log(`[Migration] Bỏ qua ${migration.id} (đã chạy)`);
      continue;
    }
    console.log(`[Migration] Đang chạy ${migration.id}`);
    await migration.up(sequelize);
    await sequelize.query('INSERT INTO schema_migrations (id) VALUES (?)', { replacements: [migration.id] });
    console.log(`[Migration] Hoàn tất ${migration.id}`);
  }
};

run()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error('[Migration] Thất bại:', error.message);
    await sequelize.close();
    process.exit(1);
  });

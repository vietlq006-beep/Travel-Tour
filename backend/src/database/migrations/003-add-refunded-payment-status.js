const { QueryTypes } = require('sequelize');
const id = '003-add-refunded-payment-status';
const up = async (sequelize) => {
  const [column] = await sequelize.query(`
    SELECT column_type AS columnType FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'payments' AND column_name = 'status'
  `, { type: QueryTypes.SELECT });
  if (!column?.columnType.includes('REFUNDED')) {
    await sequelize.query("ALTER TABLE payments MODIFY COLUMN status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING'");
  }
};
module.exports = { id, up };

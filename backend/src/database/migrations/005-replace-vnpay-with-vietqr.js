const { QueryTypes } = require('sequelize');

const id = '005-replace-vnpay-with-vietqr';

const up = async (sequelize) => {
  const [column] = await sequelize.query(`
    SELECT column_type AS columnType FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'payments' AND column_name = 'payment_method'
  `, { type: QueryTypes.SELECT });

  if (!column) return;
  const hasVnPay = column.columnType.includes('VNPAY');
  const hasVietQr = column.columnType.includes('VIETQR');

  if (hasVnPay && !hasVietQr) {
    await sequelize.query("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('CASH','BANK_TRANSFER','VNPAY','VIETQR') NOT NULL");
  }
  if (hasVnPay) {
    await sequelize.query("UPDATE payments SET payment_method = 'VIETQR' WHERE payment_method = 'VNPAY'");
  }
  if (hasVnPay || !hasVietQr) {
    await sequelize.query("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('CASH','BANK_TRANSFER','VIETQR') NOT NULL");
  }
};

module.exports = { id, up };

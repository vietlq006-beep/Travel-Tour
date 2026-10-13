const { QueryTypes } = require('sequelize');

const id = '007-payment-reconciliation-and-verification';

const hasColumn = async (sequelize, table, column) => Boolean((await sequelize.query(`
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = :table AND column_name = :column LIMIT 1
`, { replacements: { table, column }, type: QueryTypes.SELECT }))[0]);

const addColumn = async (sequelize, table, column, definition) => {
  if (!await hasColumn(sequelize, table, column)) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
};

const up = async (sequelize) => {
  await addColumn(sequelize, 'payments', 'payment_purpose', "ENUM('DEPOSIT','BALANCE','FULL') NOT NULL DEFAULT 'FULL' AFTER `payment_method`");
  await addColumn(sequelize, 'payments', 'proof_url', 'VARCHAR(500) NULL AFTER `payment_time`');
  await addColumn(sequelize, 'payments', 'proof_uploaded_at', 'DATETIME NULL AFTER `proof_url`');
  await addColumn(sequelize, 'payments', 'provider', "VARCHAR(50) NULL AFTER `proof_uploaded_at`");
  await addColumn(sequelize, 'users', 'email_verified_at', 'DATETIME NULL AFTER `email`');
  await addColumn(sequelize, 'users', 'phone_verified_at', 'DATETIME NULL AFTER `phone_number`');

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS payment_reconciliation_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source VARCHAR(40) NOT NULL,
      external_transaction_id VARCHAR(150) NOT NULL,
      event_hash CHAR(64) NOT NULL,
      payment_id INT NULL,
      transfer_content VARCHAR(255) NULL,
      amount DECIMAL(12,2) NOT NULL,
      transaction_time DATETIME NULL,
      status ENUM('MATCHED','UNMATCHED','DUPLICATE','REJECTED') NOT NULL,
      raw_data JSON NULL,
      processed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_reconciliation_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
      UNIQUE KEY uq_reconciliation_source_external (source, external_transaction_id),
      INDEX idx_reconciliation_status_time (status, processed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS user_verification_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      target VARCHAR(190) NOT NULL,
      token_type ENUM('PASSWORD_RESET','EMAIL_VERIFICATION','PHONE_VERIFICATION') NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      attempts INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uq_verification_token_hash (token_hash),
      INDEX idx_verification_target_type (target, token_type, expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

module.exports = { id, up };

const { QueryTypes } = require('sequelize');

const id = '006-booking-lifecycle-and-commercial-terms';

const hasColumn = async (sequelize, table, column) => Boolean((await sequelize.query(`
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = :table AND column_name = :column LIMIT 1
`, { replacements: { table, column }, type: QueryTypes.SELECT }))[0]);

const hasIndex = async (sequelize, table, index) => Boolean((await sequelize.query(`
  SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = :table AND index_name = :index LIMIT 1
`, { replacements: { table, index }, type: QueryTypes.SELECT }))[0]);

const addColumn = async (sequelize, table, column, definition) => {
  if (!await hasColumn(sequelize, table, column)) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
};

const addIndex = async (sequelize, table, index, columns, unique = false) => {
  if (!await hasIndex(sequelize, table, index)) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD ${unique ? 'UNIQUE ' : ''}INDEX \`${index}\` (${columns.map((column) => `\`${column}\``).join(', ')})`);
  }
};

const up = async (sequelize) => {
  const tourColumns = {
    included_services: 'TEXT NULL AFTER `overview`',
    excluded_services: 'TEXT NULL AFTER `included_services`',
    cancellation_policy: 'TEXT NULL AFTER `excluded_services`',
    change_policy: 'TEXT NULL AFTER `cancellation_policy`',
    deposit_percent: 'DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER `change_policy`',
    child_policy: 'TEXT NULL AFTER `deposit_percent`',
    infant_policy: 'TEXT NULL AFTER `child_policy`',
    senior_policy: 'TEXT NULL AFTER `infant_policy`',
    pickup_points: 'JSON NULL AFTER `senior_policy`',
    meeting_instructions: 'TEXT NULL AFTER `pickup_points`',
    luggage_policy: 'TEXT NULL AFTER `meeting_instructions`',
    insurance_details: 'TEXT NULL AFTER `luggage_policy`',
    visa_requirements: 'TEXT NULL AFTER `insurance_details`',
    required_documents: 'TEXT NULL AFTER `visa_requirements`',
    terms_and_conditions: 'TEXT NULL AFTER `required_documents`'
  };
  for (const [column, definition] of Object.entries(tourColumns)) {
    await addColumn(sequelize, 'tours', column, definition);
  }

  const departureColumns = {
    departure_city: 'VARCHAR(100) NULL AFTER `end_date`',
    meeting_point: 'VARCHAR(255) NULL AFTER `departure_city`',
    meeting_time: 'DATETIME NULL AFTER `meeting_point`',
    infant_price: 'DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `child_price`',
    senior_price: 'DECIMAL(12,2) NULL AFTER `infant_price`',
    single_room_surcharge: 'DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `senior_price`',
    terms_override: 'TEXT NULL AFTER `single_room_surcharge`'
  };
  for (const [column, definition] of Object.entries(departureColumns)) {
    await addColumn(sequelize, 'tour_departures', column, definition);
  }

  const bookingColumns = {
    num_infants: 'INT NOT NULL DEFAULT 0 AFTER `num_children`',
    num_seniors: 'INT NOT NULL DEFAULT 0 AFTER `num_infants`',
    single_room_count: 'INT NOT NULL DEFAULT 0 AFTER `num_seniors`',
    deposit_amount: 'DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `final_amount`',
    payment_due_at: 'DATETIME NULL AFTER `booking_date`',
    expired_at: 'DATETIME NULL AFTER `payment_due_at`',
    cancellation_reason: 'VARCHAR(500) NULL AFTER `status`',
    pricing_snapshot: 'JSON NULL AFTER `notes`',
    policy_snapshot: 'JSON NULL AFTER `pricing_snapshot`',
    check_in_code: 'VARCHAR(64) NULL AFTER `policy_snapshot`',
    checked_in_at: 'DATETIME NULL AFTER `check_in_code`',
    checked_in_by: 'INT NULL AFTER `checked_in_at`'
  };
  for (const [column, definition] of Object.entries(bookingColumns)) {
    await addColumn(sequelize, 'bookings', column, definition);
  }

  await sequelize.query("ALTER TABLE booking_participants MODIFY COLUMN passenger_type ENUM('ADULT','CHILD','INFANT','SENIOR') NOT NULL");
  await addIndex(sequelize, 'bookings', 'idx_bookings_payment_expiry', ['status', 'payment_due_at']);
  await addIndex(sequelize, 'bookings', 'uq_bookings_check_in_code', ['check_in_code'], true);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS booking_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      actor_id INT NULL,
      event_type VARCHAR(40) NOT NULL,
      from_status VARCHAR(30) NULL,
      to_status VARCHAR(30) NULL,
      note VARCHAR(1000) NULL,
      metadata JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_booking_activities_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      CONSTRAINT fk_booking_activities_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_booking_activities_booking_created (booking_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS booking_change_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      user_id INT NOT NULL,
      request_type ENUM('CANCEL','RESCHEDULE','REFUND') NOT NULL,
      requested_departure_id INT NULL,
      reason VARCHAR(1000) NOT NULL,
      status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
      admin_note VARCHAR(1000) NULL,
      reviewed_by INT NULL,
      reviewed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_change_requests_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      CONSTRAINT fk_change_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT fk_change_requests_departure FOREIGN KEY (requested_departure_id) REFERENCES tour_departures(id) ON DELETE SET NULL,
      CONSTRAINT fk_change_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_change_requests_booking (booking_id),
      INDEX idx_change_requests_status_created (status, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

module.exports = { id, up };

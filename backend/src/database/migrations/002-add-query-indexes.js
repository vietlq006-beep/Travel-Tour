const { QueryTypes } = require('sequelize');
const id = '002-add-query-indexes';
const indexes = [
  ['users', 'idx_users_role_active', ['role', 'is_active']],
  ['tours', 'idx_tours_active_created', ['is_active', 'created_at']],
  ['tour_departures', 'idx_departures_status_date', ['status', 'start_date']],
  ['vouchers', 'idx_vouchers_active_dates', ['is_active', 'start_date', 'end_date']],
  ['bookings', 'idx_bookings_user_date', ['user_id', 'booking_date']],
  ['bookings', 'idx_bookings_status_date', ['status', 'booking_date']],
  ['payments', 'idx_payments_booking_status', ['booking_id', 'status']],
  ['reviews', 'idx_reviews_tour_created', ['tour_id', 'created_at']]
];
const up = async (sequelize) => {
  for (const [table, name, columns] of indexes) {
    const exists = await sequelize.query(`
      SELECT 1 FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = :table AND index_name = :name LIMIT 1
    `, { replacements: { table, name }, type: QueryTypes.SELECT });
    if (!exists.length) await sequelize.query(`ALTER TABLE \`${table}\` ADD INDEX \`${name}\` (${columns.map((column) => `\`${column}\``).join(', ')})`);
  }
};
module.exports = { id, up };

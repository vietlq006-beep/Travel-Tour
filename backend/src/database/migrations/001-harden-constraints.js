const { QueryTypes } = require('sequelize');

const id = '001-harden-constraints';

const hasConstraint = async (sequelize, table, name) => Boolean(await sequelize.query(`
  SELECT 1 FROM information_schema.table_constraints
  WHERE table_schema = DATABASE() AND table_name = :table AND constraint_name = :name LIMIT 1
`, { replacements: { table, name }, type: QueryTypes.SELECT }).then((rows) => rows[0]));

const hasIndex = async (sequelize, table, name) => Boolean(await sequelize.query(`
  SELECT 1 FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = :table AND index_name = :name LIMIT 1
`, { replacements: { table, name }, type: QueryTypes.SELECT }).then((rows) => rows[0]));

const addConstraint = async (sequelize, table, name, definition) => {
  if (!await hasConstraint(sequelize, table, name)) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\` ${definition}`);
  }
};

const addUniqueIndex = async (sequelize, table, name, columns) => {
  if (!await hasIndex(sequelize, table, name)) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD UNIQUE KEY \`${name}\` (${columns.map((column) => `\`${column}\``).join(', ')})`);
  }
};

const up = async (sequelize) => {
  await addUniqueIndex(sequelize, 'tour_itineraries', 'uq_itinerary_tour_day', ['tour_id', 'day_number']);
  await addConstraint(sequelize, 'tour_itineraries', 'chk_itinerary_day_positive', 'CHECK (`day_number` > 0)');
  await addConstraint(sequelize, 'tour_departures', 'chk_departure_dates', 'CHECK (`end_date` >= `start_date`)');
  await addConstraint(sequelize, 'tour_departures', 'chk_departure_capacity', 'CHECK (`capacity` > 0 AND `booked_seats` >= 0 AND `booked_seats` <= `capacity`)');
  await addConstraint(sequelize, 'tour_departures', 'chk_departure_prices', 'CHECK (`adult_price` > 0 AND `child_price` >= 0)');
  await addConstraint(sequelize, 'vouchers', 'chk_voucher_value', "CHECK (`discount_value` > 0 AND (`discount_type` <> 'PERCENT' OR `discount_value` <= 100))");
  await addConstraint(sequelize, 'vouchers', 'chk_voucher_usage', 'CHECK (`max_usage` > 0 AND `used_count` >= 0 AND `used_count` <= `max_usage`)');
  await addConstraint(sequelize, 'vouchers', 'chk_voucher_dates', 'CHECK (`end_date` > `start_date`)');
  await addConstraint(sequelize, 'bookings', 'chk_booking_passengers', 'CHECK (`num_adults` > 0 AND `num_children` >= 0)');
  await addConstraint(sequelize, 'bookings', 'chk_booking_amounts', 'CHECK (`total_amount` >= 0 AND `discount_amount` >= 0 AND `final_amount` >= 0 AND `final_amount` = `total_amount` - `discount_amount`)');
  await addUniqueIndex(sequelize, 'payments', 'uq_payments_trans_id', ['transaction_id']);
  await addConstraint(sequelize, 'reviews', 'chk_reviews_rating', 'CHECK (`rating` BETWEEN 1 AND 5)');
};

module.exports = { id, up };

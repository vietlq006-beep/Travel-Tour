const { QueryTypes } = require('sequelize');

const id = '004-add-tour-video-url';

const up = async (sequelize) => {
  const columns = await sequelize.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'tours'
      AND column_name = 'video_url'
    LIMIT 1
  `, { type: QueryTypes.SELECT });

  if (!columns.length) {
    await sequelize.query('ALTER TABLE tours ADD COLUMN video_url VARCHAR(500) NULL AFTER images');
  }
};

module.exports = { id, up };

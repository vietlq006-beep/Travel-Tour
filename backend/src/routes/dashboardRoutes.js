const router = require('express').Router();
const c = require('../controllers/dashboardController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { isValidDate } = require('../validators/commonValidator');
router.use(authenticateToken, authorizeRoles('ADMIN'));
router.get('/summary', wrap(c.summary));
router.get('/analytics', validate((req) => {
  const errors = [];
  if (req.query.fromDate && !isValidDate(req.query.fromDate)) errors.push({ field: 'fromDate', message: 'Ngày bắt đầu không hợp lệ' });
  if (req.query.toDate && !isValidDate(req.query.toDate)) errors.push({ field: 'toDate', message: 'Ngày kết thúc không hợp lệ' });
  if (req.query.fromDate && req.query.toDate && new Date(req.query.fromDate) > new Date(req.query.toDate)) errors.push({ field: 'toDate', message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi' });
  return errors;
}), wrap(c.analytics));
module.exports = router;

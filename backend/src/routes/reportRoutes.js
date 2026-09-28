const router = require('express').Router();
const c = require('../controllers/reportController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { isValidDate } = require('../validators/commonValidator');
const BOOKING_STATUS = require('../constants/bookingStatus');
router.use(authenticateToken, authorizeRoles('ADMIN'));
router.get('/bookings.xlsx', validate((req) => {
  const errors = [];
  if (req.query.fromDate && !isValidDate(req.query.fromDate)) errors.push({ field: 'fromDate', message: 'Ngày bắt đầu không hợp lệ' });
  if (req.query.toDate && !isValidDate(req.query.toDate)) errors.push({ field: 'toDate', message: 'Ngày kết thúc không hợp lệ' });
  if (req.query.status && !Object.values(BOOKING_STATUS).includes(req.query.status)) errors.push({ field: 'status', message: 'Trạng thái đơn không hợp lệ' });
  return errors;
}), wrap(c.exportBookings));
module.exports = router;

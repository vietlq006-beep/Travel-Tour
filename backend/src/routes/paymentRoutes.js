const router = require('express').Router();
const c = require('../controllers/paymentController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateCreatePayment, validatePaymentStatus, validatePaymentQuery } = require('../validators/paymentValidator');
const { validateIdParam, validatePagination } = require('../validators/commonValidator');
router.use(authenticateToken);
router.post('/', validate(validateCreatePayment), wrap(c.create));
router.get('/', authorizeRoles('ADMIN'), validate(validatePagination), validate(validatePaymentQuery), wrap(c.list));
router.get('/booking/:bookingId', validate((req) => Number.isInteger(Number(req.params.bookingId)) && Number(req.params.bookingId) > 0
  ? [] : [{ field: 'bookingId', message: 'Mã đơn đặt chỗ không hợp lệ' }]), wrap(c.listByBooking));
router.patch('/:id/status', authorizeRoles('ADMIN'), validate(validateIdParam), validate(validatePaymentStatus), wrap(c.updateStatus));
module.exports = router;

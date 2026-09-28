const router = require('express').Router();
const c = require('../controllers/paymentController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateCreatePayment, validatePaymentStatus } = require('../validators/paymentValidator');
const { validateIdParam } = require('../validators/commonValidator');
router.get('/vnpay/ipn', wrap(c.vnpayIpn));
router.get('/vnpay/return', wrap(c.vnpayReturn));
router.use(authenticateToken);
router.post('/', validate(validateCreatePayment), wrap(c.create));
router.get('/booking/:bookingId', validate((req) => Number.isInteger(Number(req.params.bookingId)) && Number(req.params.bookingId) > 0
  ? [] : [{ field: 'bookingId', message: 'Mã đơn đặt chỗ không hợp lệ' }]), wrap(c.listByBooking));
router.patch('/:id/status', authorizeRoles('ADMIN'), validate(validateIdParam), validate(validatePaymentStatus), wrap(c.updateStatus));
module.exports = router;

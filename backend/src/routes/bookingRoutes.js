const router = require('express').Router();
const c = require('../controllers/bookingController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateCreateBooking, validateBookingStatus, validateChangeRequest, validateChangeRequestDecision } = require('../validators/bookingValidator');
const { validateIdParam, validatePagination } = require('../validators/commonValidator');
const { validateBookingQuery } = require('../validators/queryValidator');
router.use(authenticateToken);
router.get('/', validate(validatePagination), validate(validateBookingQuery), wrap(c.list));
router.get('/change-requests', validate(validatePagination), wrap(c.listChangeRequests));
router.patch('/change-requests/:id', authorizeRoles('ADMIN'), validate(validateIdParam), validate(validateChangeRequestDecision), wrap(c.reviewChangeRequest));
router.post('/check-in', authorizeRoles('ADMIN'), validate((req) => typeof req.body.code === 'string' && req.body.code.trim().length >= 10
  ? [] : [{ field: 'code', message: 'Mã check-in không hợp lệ' }]), wrap(c.checkIn));
router.post('/', validate(validateCreateBooking), wrap(c.create));
router.post('/:id/cancel', validate(validateIdParam), wrap(c.cancel));
router.post('/:id/change-requests', validate(validateIdParam), validate(validateChangeRequest), wrap(c.createChangeRequest));
router.post('/:id/notes', authorizeRoles('ADMIN'), validate(validateIdParam), validate((req) => typeof req.body.note === 'string' && req.body.note.trim().length >= 2 && req.body.note.length <= 1000
  ? [] : [{ field: 'note', message: 'Ghi chú phải từ 2 đến 1.000 ký tự' }]), wrap(c.addNote));
router.patch('/:id/status', authorizeRoles('ADMIN'), validate(validateIdParam), validate(validateBookingStatus), wrap(c.changeStatus));
router.get('/:id/ticket', validate(validateIdParam), wrap(c.ticket));
router.get('/:id', validate(validateIdParam), wrap(c.get));
module.exports = router;

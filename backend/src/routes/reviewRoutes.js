const router = require('express').Router();
const c = require('../controllers/reviewController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateReview } = require('../validators/reviewValidator');
const { validateIdParam, validatePagination } = require('../validators/commonValidator');
router.get('/tour/:tourId', validate((req) => Number.isInteger(Number(req.params.tourId)) && Number(req.params.tourId) > 0
  ? [] : [{ field: 'tourId', message: 'Mã tour không hợp lệ' }]), validate(validatePagination), wrap(c.listByTour));
router.use(authenticateToken);
router.post('/', validate(validateReview), wrap(c.create));
router.put('/:id', validate(validateIdParam), validate(validateReview), wrap(c.update));
router.delete('/:id', validate(validateIdParam), wrap(c.remove));
module.exports = router;

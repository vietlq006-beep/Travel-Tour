const router = require('express').Router();
const controller = require('../controllers/tourController');
const wrap = require('../utils/asyncHandler');
const validate = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles, optionalAuthenticate } = require('../middlewares/authMiddleware');
const { uploadImage } = require('../middlewares/uploadMiddleware');
const { validateTour } = require('../validators/tourValidator');
const { validateIdParam, validatePagination } = require('../validators/commonValidator');
const { validateTourQuery } = require('../validators/queryValidator');

const tourImages = uploadImage.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 8 }]);
router.get('/', optionalAuthenticate, validate(validatePagination), validate(validateTourQuery), wrap(controller.list));
router.get('/:id', optionalAuthenticate, validate(validateIdParam), wrap(controller.getById));
router.use(authenticateToken, authorizeRoles('ADMIN'));
router.post('/', tourImages, validate(validateTour), wrap(controller.create));
router.put('/:id', tourImages, validate(validateIdParam), validate(validateTour), wrap(controller.update));
router.delete('/:id', validate(validateIdParam), wrap(controller.remove));

module.exports = router;

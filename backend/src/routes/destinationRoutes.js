const router = require('express').Router();
const controller = require('../controllers/destinationController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadImage } = require('../middlewares/uploadMiddleware');
const { validateDestination } = require('../validators/destinationValidator');
const { validateIdParam, validatePagination } = require('../validators/commonValidator');

router.get('/', validateRequest(validatePagination), asyncHandler(controller.list));
router.get('/:id', validateRequest(validateIdParam), asyncHandler(controller.getById));
router.use(authenticateToken, authorizeRoles('ADMIN'));
router.post('/', uploadImage.single('image'), validateRequest(validateDestination), asyncHandler(controller.create));
router.put('/:id', uploadImage.single('image'), validateRequest(validateIdParam), validateRequest(validateDestination), asyncHandler(controller.update));
router.delete('/:id', validateRequest(validateIdParam), asyncHandler(controller.remove));

module.exports = router;

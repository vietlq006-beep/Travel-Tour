const router = require('express').Router();
const controller = require('../controllers/categoryController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { uploadImage } = require('../middlewares/uploadMiddleware');
const { validateCategory } = require('../validators/categoryValidator');
const { validateIdParam, validatePagination } = require('../validators/commonValidator');

router.get('/', validateRequest(validatePagination), asyncHandler(controller.list.bind(controller)));
router.get('/:id', validateRequest(validateIdParam), asyncHandler(controller.getById.bind(controller)));
router.use(authenticateToken, authorizeRoles('ADMIN'));
router.post('/', uploadImage.single('image'), validateRequest(validateCategory), asyncHandler(controller.create.bind(controller)));
router.put('/:id', uploadImage.single('image'), validateRequest(validateIdParam), validateRequest(validateCategory), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', validateRequest(validateIdParam), asyncHandler(controller.remove.bind(controller)));

module.exports = router;

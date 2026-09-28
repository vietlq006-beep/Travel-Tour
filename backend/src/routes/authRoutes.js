const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { validateRegister, validateLogin, validateProfile } = require('../validators/authValidator');
const { authLimiter } = require('../middlewares/rateLimiters');

// Public routes
router.post('/register', authLimiter, validateRequest(validateRegister), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validateRequest(validateLogin), (req, res, next) => authController.login(req, res, next));

// Protected routes (Yêu cầu đăng nhập - JWT)
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', authenticateToken, validateRequest(validateProfile), (req, res, next) => authController.updateProfile(req, res, next));

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// Public routes
router.post('/register', validateRequest(validateRegister), (req, res, next) => authController.register(req, res, next));
router.post('/login', validateRequest(validateLogin), (req, res, next) => authController.login(req, res, next));

// Protected routes (Yêu cầu đăng nhập - JWT)
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', authenticateToken, (req, res, next) => authController.updateProfile(req, res, next));

module.exports = router;

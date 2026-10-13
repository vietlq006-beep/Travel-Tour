const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  validateRegister, validateLogin, validateProfile, validateForgotPassword,
  validateResetPassword, validateVerificationToken, validatePhoneVerification
} = require('../validators/authValidator');
const { authLimiter } = require('../middlewares/rateLimiters');

// Public routes
router.post('/register', authLimiter, validateRequest(validateRegister), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validateRequest(validateLogin), (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', authLimiter, validateRequest(validateForgotPassword), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, validateRequest(validateResetPassword), (req, res, next) => authController.resetPassword(req, res, next));

// Protected routes (Yêu cầu đăng nhập - JWT)
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', authenticateToken, validateRequest(validateProfile), (req, res, next) => authController.updateProfile(req, res, next));
router.post('/verification/email/request', authenticateToken, authLimiter, (req, res, next) => authController.requestEmailVerification(req, res, next));
router.post('/verification/email/confirm', authenticateToken, authLimiter, validateRequest(validateVerificationToken), (req, res, next) => authController.confirmEmailVerification(req, res, next));
router.post('/verification/phone/request', authenticateToken, authLimiter, validateRequest(validatePhoneVerification), (req, res, next) => authController.requestPhoneVerification(req, res, next));
router.post('/verification/phone/confirm', authenticateToken, authLimiter, validateRequest(validateVerificationToken), (req, res, next) => authController.confirmPhoneVerification(req, res, next));

module.exports = router;

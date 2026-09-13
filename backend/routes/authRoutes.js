const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  getVirtualMailbox
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/virtual-mailbox', getVirtualMailbox);

// Protected session route
router.get('/me', verifyToken, getMe);

module.exports = router;

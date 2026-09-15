const express = require('express');
const router = express.Router();
const {
  registerDonation,
  getMyDonations,
  getDonationByToken,
  getDonations,
  verifyDonation,
  rejectDonation,
  completeDonation,
  getReceipt,
  getDonationTimeline
} = require('../controllers/donationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { verifyToken: decodeJwt } = require('../utils/jwtUtils');
const userModel = require('../models/userModel');

/**
 * Optional authentication middleware:
 * If an auth token is provided, attach req.user so the donation is linked to their account.
 * If no token is provided, guest registration proceeds without error.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = decodeJwt(token);
      if (decoded && decoded.id) {
        const user = await userModel.findById(decoded.id);
        if (user) req.user = user;
      }
    } catch {
      // Ignore token decode error for optional auth
    }
  }
  next();
}

// Public / Donor routes
router.post('/', optionalAuth, registerDonation);
router.get('/token/:token', getDonationByToken);

// Authenticated Donor / Admin routes
router.get('/my', verifyToken, getMyDonations);
router.get('/:id/receipt', verifyToken, getReceipt);
router.get('/:id/timeline', verifyToken, getDonationTimeline);

// Admin-only management routes
router.get('/', verifyToken, requireRole('Admin'), getDonations);
router.put('/:id/verify', verifyToken, requireRole('Admin'), verifyDonation);
router.put('/:id/reject', verifyToken, requireRole('Admin'), rejectDonation);
router.put('/:id/complete', verifyToken, requireRole('Admin'), completeDonation);

module.exports = router;

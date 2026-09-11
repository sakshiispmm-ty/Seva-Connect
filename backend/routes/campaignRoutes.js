const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign
} = require('../controllers/campaignController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCampaigns);
router.get('/:id', getCampaign);

// Admin-only management routes
router.post('/', verifyToken, requireRole('Admin'), createCampaign);
router.put('/:id', verifyToken, requireRole('Admin'), updateCampaign);

module.exports = router;

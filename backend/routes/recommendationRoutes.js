const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const {
  getRecommendedCampaigns,
  getSuggestedTasks
} = require('../controllers/recommendationController');

// GET /api/recommendations/campaigns (Donor & Admin)
router.get('/campaigns', verifyToken, requireRole('Donor', 'Admin'), getRecommendedCampaigns);

// GET /api/recommendations/tasks (Volunteer & Admin)
router.get('/tasks', verifyToken, requireRole('Volunteer', 'Admin'), getSuggestedTasks);

module.exports = router;

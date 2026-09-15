const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Authenticated user endpoints
router.post('/', verifyToken, feedbackController.submitFeedback);
router.put('/:id', verifyToken, feedbackController.updateFeedback);
router.get('/mine', verifyToken, feedbackController.getMyFeedback);

// Admin-only review endpoint
router.get('/', verifyToken, requireRole('Admin'), feedbackController.getAllFeedback);

module.exports = router;

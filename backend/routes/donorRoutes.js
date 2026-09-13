const express = require('express');
const router = express.Router();
const { getAllDonors } = require('../controllers/donorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin only access
router.use(verifyToken);
router.use(requireRole('Admin'));

router.get('/', getAllDonors);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUsers, getStats } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require valid JWT and Admin role
router.use(verifyToken);
router.use(requireRole('Admin'));

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/stats
router.get('/stats', getStats);

module.exports = router;

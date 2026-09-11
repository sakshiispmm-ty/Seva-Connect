const express = require('express');
const router = express.Router();
const { getUsers, getStats, deleteUser } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require valid JWT and Admin role
router.use(verifyToken);
router.use(requireRole('Admin'));

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/stats
router.get('/stats', getStats);

// DELETE /api/admin/users/:id (DEF-07 / TC-ADM-05)
router.delete('/users/:id', deleteUser);

module.exports = router;

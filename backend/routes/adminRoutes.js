const express = require('express');
const router = express.Router();
const {
  getUsers,
  getStats,
  deleteUser,
  deactivateUser,
  reactivateUser,
  updateUserRole,
  getAuditLogs
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require valid JWT and Admin role
router.use(verifyToken);
router.use(requireRole('Admin'));

// User Management Routes
router.get('/users', getUsers);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/reactivate', reactivateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Audit Log Routes (Immutable, write-only from API)
router.get('/audit-log', getAuditLogs);

// System Stats
router.get('/stats', getStats);

module.exports = router;

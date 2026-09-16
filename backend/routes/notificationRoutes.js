const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  getDigest
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// All notification endpoints require authenticated session
router.use(verifyToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/digest', getDigest);
router.put('/read-all', markAllAsRead);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;

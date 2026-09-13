const notificationModel = require('../models/notificationModel');

/**
 * GET /api/notifications
 * Access: Authenticated (any user role)
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await notificationModel.getByRecipient(userId);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('[Notification Controller] getNotifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.'
    });
  }
}

/**
 * GET /api/notifications/unread-count
 * Access: Authenticated (any user role)
 */
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const unreadCount = await notificationModel.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('[Notification Controller] getUnreadCount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count.'
    });
  }
}

/**
 * PUT /api/notifications/:id/read
 * Access: Authenticated
 */
async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.'
      });
    }

    const updated = await notificationModel.markAsRead(id, userId);

    return res.status(200).json({
      success: true,
      message: updated ? 'Notification marked as read.' : 'Notification not found or already read.'
    });
  } catch (error) {
    console.error('[Notification Controller] markAsRead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read.'
    });
  }
}

/**
 * PUT /api/notifications/read-all
 * Access: Authenticated
 */
async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const count = await notificationModel.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      count
    });
  } catch (error) {
    console.error('[Notification Controller] markAllAsRead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.'
    });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};

const { query } = require('../config/db');

const notificationModel = {
  /**
   * Create a notification for a user
   */
  async create({
    recipient_id,
    type,
    message,
    reference_type = null,
    reference_id = null
  }) {
    const sql = `
      INSERT INTO notifications (recipient_id, type, message, reference_type, reference_id, is_read)
      VALUES (?, ?, ?, ?, ?, FALSE)
    `;
    const [result] = await query(sql, [
      parseInt(recipient_id, 10),
      type,
      message,
      reference_type,
      reference_id ? parseInt(reference_id, 10) : null
    ]);

    return {
      id: result.insertId,
      recipient_id: parseInt(recipient_id, 10),
      type,
      message,
      reference_type,
      reference_id,
      is_read: false,
      created_at: new Date().toISOString()
    };
  },

  /**
   * Broadcast a notification to all Admin users
   */
  async notifyAdmins({ type, message, reference_type = null, reference_id = null }) {
    const [admins] = await query("SELECT id FROM users WHERE role = 'Admin'");
    if (!admins || admins.length === 0) return [];

    const created = [];
    for (const admin of admins) {
      const notif = await this.create({
        recipient_id: admin.id,
        type,
        message,
        reference_type,
        reference_id
      });
      created.push(notif);
    }
    return created;
  },

  /**
   * Get all notifications for a specific recipient (newest first)
   */
  async getByRecipient(recipientId) {
    const sql = `
      SELECT * FROM notifications 
      WHERE recipient_id = ? 
      ORDER BY created_at DESC
    `;
    const [rows] = await query(sql, [parseInt(recipientId, 10)]);
    return (rows || []).map(n => ({
      ...n,
      is_read: Boolean(n.is_read)
    }));
  },

  /**
   * Count unread notifications for a specific recipient
   */
  async getUnreadCount(recipientId) {
    const sql = `
      SELECT COUNT(*) AS unread_count 
      FROM notifications 
      WHERE recipient_id = ? AND is_read = FALSE
    `;
    const [rows] = await query(sql, [parseInt(recipientId, 10)]);
    return rows && rows[0] ? parseInt(rows[0].unread_count || rows[0].count || 0, 10) : 0;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id, recipientId) {
    const sql = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ? AND recipient_id = ?
    `;
    const [result] = await query(sql, [parseInt(id, 10), parseInt(recipientId, 10)]);
    return result.affectedRows > 0;
  },

  /**
   * Mark all notifications as read for a recipient
   */
  async markAllAsRead(recipientId) {
    const sql = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE recipient_id = ?
    `;
    const [result] = await query(sql, [parseInt(recipientId, 10)]);
    return result.affectedRows;
  }
};

module.exports = notificationModel;

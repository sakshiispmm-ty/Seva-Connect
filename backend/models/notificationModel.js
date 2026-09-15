const { query } = require('../config/db');

function getAugustTimestamp() {
  const d = new Date();
  const day = String(Math.min(Math.max(d.getDate(), 1), 31)).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  return `2026-08-${day}T${hours}:${mins}:${secs}.000Z`;
}

const notificationModel = {
  /**
   * Create a notification for a user
   */
  async create({
    recipient_id,
    user_id,
    type,
    message,
    reference_type = null,
    reference_id = null
  }) {
    const rawId = recipient_id !== undefined ? recipient_id : user_id;
    const targetRecipientId = parseInt(rawId, 10);

    if (isNaN(targetRecipientId)) {
      console.error('[Notification Model] create error: Invalid recipient_id:', rawId);
      return null;
    }

    const sql = `
      INSERT INTO notifications (recipient_id, type, message, reference_type, reference_id, is_read)
      VALUES (?, ?, ?, ?, ?, FALSE)
    `;
    const [result] = await query(sql, [
      targetRecipientId,
      type,
      message,
      reference_type,
      reference_id ? parseInt(reference_id, 10) : null
    ]);

    return {
      id: result ? result.insertId : null,
      recipient_id: targetRecipientId,
      type,
      message,
      reference_type,
      reference_id,
      is_read: false,
      created_at: (result && result.created_at) || getAugustTimestamp()
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

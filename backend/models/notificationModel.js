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

    // Check user notification preferences before inserting
    try {
      const [prefRows] = await query("SELECT * FROM notification_preferences WHERE user_id = ?", [targetRecipientId]);
      const prefs = prefRows && prefRows[0] ? prefRows[0] : { donations: true, tasks: true, system: true };
      
      const cleanType = String(type || '').toLowerCase();
      let category = 'system';
      if (cleanType.includes('donation')) category = 'donations';
      else if (cleanType.includes('volunteer') || cleanType.includes('task') || cleanType.includes('badge') || cleanType.includes('point')) category = 'tasks';

      if (prefs[category] === false) {
        // Notification muted by user preference
        return null;
      }
    } catch (prefErr) {
      console.warn('[Notification Model] could not check preferences:', prefErr.message);
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
  },

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId) {
    const uId = parseInt(userId, 10);
    const [rows] = await query("SELECT * FROM notification_preferences WHERE user_id = ?", [uId]);
    if (rows && rows.length > 0) {
      const p = rows[0];
      return {
        user_id: uId,
        donations: Boolean(p.donations !== false && p.donations !== 0),
        tasks: Boolean(p.tasks !== false && p.tasks !== 0),
        system: Boolean(p.system !== false && p.system !== 0),
        email_digest: Boolean(p.email_digest === true || p.email_digest === 1)
      };
    }
    return {
      user_id: uId,
      donations: true,
      tasks: true,
      system: true,
      email_digest: false
    };
  },

  /**
   * Update or upsert notification preferences for a user
   */
  async updatePreferences(userId, prefs) {
    const uId = parseInt(userId, 10);
    const donations = prefs.donations !== false && prefs.donations !== 0 ? 1 : 0;
    const tasks = prefs.tasks !== false && prefs.tasks !== 0 ? 1 : 0;
    const system = prefs.system !== false && prefs.system !== 0 ? 1 : 0;
    const email_digest = prefs.email_digest === true || prefs.email_digest === 1 ? 1 : 0;

    const [existing] = await query("SELECT id FROM notification_preferences WHERE user_id = ?", [uId]);
    if (existing && existing.length > 0) {
      await query(
        "UPDATE notification_preferences SET donations = ?, tasks = ?, system = ?, email_digest = ? WHERE user_id = ?",
        [donations, tasks, system, email_digest, uId]
      );
    } else {
      await query(
        "INSERT INTO notification_preferences (user_id, donations, tasks, system, email_digest) VALUES (?, ?, ?, ?, ?)",
        [uId, donations, tasks, system, email_digest]
      );
    }

    return this.getPreferences(uId);
  },

  /**
   * Get notification activity digest
   */
  async getDigest(userId) {
    const uId = parseInt(userId, 10);
    const allNotifs = await this.getByRecipient(uId);
    
    // Group into categories
    const categories = {
      donations: [],
      tasks: [],
      system: []
    };

    allNotifs.forEach(n => {
      const cleanType = String(n.type || '').toLowerCase();
      if (cleanType.includes('donation')) {
        categories.donations.push(n);
      } else if (cleanType.includes('volunteer') || cleanType.includes('task') || cleanType.includes('badge') || cleanType.includes('point')) {
        categories.tasks.push(n);
      } else {
        categories.system.push(n);
      }
    });

    const unreadCount = allNotifs.filter(n => !n.is_read).length;
    const unreadDonations = categories.donations.filter(n => !n.is_read).length;
    const unreadTasks = categories.tasks.filter(n => !n.is_read).length;
    const unreadSystem = categories.system.filter(n => !n.is_read).length;

    // Recent top highlights (last 5)
    const recentHighlights = allNotifs.slice(0, 5);

    return {
      userId: uId,
      totalCount: allNotifs.length,
      unreadCount,
      categoryCounts: {
        donations: { total: categories.donations.length, unread: unreadDonations },
        tasks: { total: categories.tasks.length, unread: unreadTasks },
        system: { total: categories.system.length, unread: unreadSystem }
      },
      recentHighlights,
      categories
    };
  }
};

module.exports = notificationModel;

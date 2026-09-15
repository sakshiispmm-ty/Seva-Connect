const { query } = require('../config/db');

const donationStatusHistoryModel = {
  /**
   * Log a new status transition
   */
  async logStatusChange(donationId, status, changedBy = null, createdAt = null) {
    const id = parseInt(donationId, 10);
    const changer = changedBy ? parseInt(changedBy, 10) : null;
    const now = createdAt || new Date().toISOString();

    const sql = `
      INSERT INTO donation_status_history (donation_id, status, changed_by, created_at)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await query(sql, [id, status, changer, now]);
    return result.insertId;
  },

  /**
   * Get all chronological transitions for a donation
   */
  async getByDonationId(donationId) {
    const id = parseInt(donationId, 10);
    const sql = `
      SELECT h.*, u.name AS changed_by_name
      FROM donation_status_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.donation_id = ?
      ORDER BY h.created_at ASC
    `;
    const [rows] = await query(sql, [id]);
    return rows || [];
  }
};

module.exports = donationStatusHistoryModel;

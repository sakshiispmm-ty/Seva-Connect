const { query } = require('../config/db');
const donationModel = require('./donationModel');
const campaignModel = require('./campaignModel');

const feedbackModel = {
  /**
   * Check eligibility for leaving feedback
   */
  async checkEligibility(userId, feedbackType, referenceId) {
    const uId = parseInt(userId, 10);
    const refId = parseInt(referenceId, 10);

    if (feedbackType === 'Donation') {
      const donation = await donationModel.getById(refId);
      if (!donation) {
        return { eligible: false, message: 'Donation record not found.' };
      }
      if (donation.status !== 'Completed') {
        return { eligible: false, message: 'Feedback can only be provided for completed donations.' };
      }
      if (donation.donor_id !== uId) {
        // Also check email if donor_id was null originally
        const [users] = await query('SELECT email FROM users WHERE id = ?', [uId]);
        const userEmail = users?.[0]?.email?.toLowerCase();
        if (!userEmail || donation.donor_email?.toLowerCase() !== userEmail) {
          return { eligible: false, message: 'You can only leave feedback on your own completed donations.' };
        }
      }
      return { eligible: true, target: donation };
    }

    if (feedbackType === 'VolunteerTask') {
      // Find assistance request
      const [reqRows] = await query('SELECT * FROM assistance_requests WHERE id = ?', [refId]);
      const task = reqRows?.[0];
      if (!task) {
        return { eligible: false, message: 'Assistance request task not found.' };
      }
      if (task.status !== 'Completed') {
        return { eligible: false, message: 'Feedback can only be provided on completed tasks.' };
      }

      // Check volunteer assignment: task.assigned_volunteer_id may be volunteer profile ID or user ID
      const [volRows] = await query('SELECT id FROM volunteers WHERE user_id = ?', [uId]);
      const volunteerProfileId = volRows?.[0]?.id;

      const isAssigned = (task.assigned_volunteer_id === uId) || 
                         (volunteerProfileId && task.assigned_volunteer_id === volunteerProfileId);

      if (!isAssigned) {
        return { eligible: false, message: 'You can only leave feedback on tasks assigned to and completed by you.' };
      }
      return { eligible: true, target: task };
    }

    if (feedbackType === 'Campaign') {
      const campaign = await campaignModel.getById(refId);
      if (!campaign) {
        return { eligible: false, message: 'Campaign not found.' };
      }

      // Donor must have contributed to this campaign
      const [donRows] = await query(
        'SELECT id FROM donations WHERE campaign_id = ? AND (donor_id = ? OR LOWER(donor_email) = (SELECT LOWER(email) FROM users WHERE id = ?))',
        [refId, uId, uId]
      );

      if (!donRows || donRows.length === 0) {
        return { eligible: false, message: 'You can only leave feedback for campaigns you have contributed to.' };
      }
      return { eligible: true, target: campaign };
    }

    return { eligible: false, message: 'Invalid feedback target type.' };
  },

  /**
   * Find existing feedback for a specific target by user
   */
  async getByTarget(userId, feedbackType, referenceId) {
    const sql = `
      SELECT * FROM feedback 
      WHERE user_id = ? AND feedback_type = ? AND reference_id = ?
    `;
    const [rows] = await query(sql, [parseInt(userId, 10), feedbackType, parseInt(referenceId, 10)]);
    return rows && rows[0] ? rows[0] : null;
  },

  /**
   * Find feedback by primary ID
   */
  async getById(id) {
    const sql = `SELECT * FROM feedback WHERE id = ?`;
    const [rows] = await query(sql, [parseInt(id, 10)]);
    return rows && rows[0] ? rows[0] : null;
  },

  /**
   * Create new feedback
   */
  async create({ userId, feedbackType, referenceId, rating, comment }) {
    const now = new Date().toISOString();
    const sql = `
      INSERT INTO feedback (user_id, feedback_type, reference_id, rating, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [
      parseInt(userId, 10),
      feedbackType,
      parseInt(referenceId, 10),
      parseInt(rating, 10),
      (comment || '').trim(),
      now,
      now
    ]);
    return result.insertId;
  },

  /**
   * Update existing feedback (owner only)
   */
  async update(id, userId, { rating, comment }) {
    const now = new Date().toISOString();
    const sql = `
      UPDATE feedback 
      SET rating = ?, comment = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await query(sql, [
      parseInt(rating, 10),
      (comment || '').trim(),
      now,
      parseInt(id, 10),
      parseInt(userId, 10)
    ]);
    return result.affectedRows > 0;
  },

  /**
   * Get all feedback submitted by the current user
   */
  async getMine(userId) {
    const sql = `
      SELECT f.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
    const [rows] = await query(sql, [parseInt(userId, 10)]);
    return rows || [];
  },

  /**
   * Get all feedback (Admin view with filters)
   */
  async getAll({ type, rating, search } = {}) {
    let sql = `
      SELECT f.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (type && type !== 'All') {
      conditions.push('f.feedback_type = ?');
      params.push(type);
    }

    if (rating && rating !== 'All') {
      conditions.push('f.rating = ?');
      params.push(parseInt(rating, 10));
    }

    if (search && search.trim()) {
      conditions.push('(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(f.comment) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY f.created_at DESC`;

    const [rows] = await query(sql, params);
    let results = rows || [];

    // Memory filter fallback
    if (type && type !== 'All') {
      results = results.filter(f => f.feedback_type === type);
    }
    if (rating && rating !== 'All') {
      results = results.filter(f => parseInt(f.rating, 10) === parseInt(rating, 10));
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      results = results.filter(f => 
        (f.user_name && f.user_name.toLowerCase().includes(s)) ||
        (f.user_email && f.user_email.toLowerCase().includes(s)) ||
        (f.comment && f.comment.toLowerCase().includes(s)) ||
        (f.target_title && f.target_title.toLowerCase().includes(s))
      );
    }

    return results;
  }
};

module.exports = feedbackModel;

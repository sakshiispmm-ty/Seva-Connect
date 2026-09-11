const { query } = require('../config/db');

const donationModel = {
  /**
   * Generates a safe, human-readable token: SC-DON-000001
   */
  async generateNextToken() {
    const [rows] = await query('SELECT MAX(id) AS maxId FROM donations');
    let nextId = (rows?.[0]?.maxId || 0) + 1;
    let token = `SC-DON-${String(nextId).padStart(6, '0')}`;
    while (await this.getByToken(token)) {
      nextId++;
      token = `SC-DON-${String(nextId).padStart(6, '0')}`;
    }
    return token;
  },

  /**
   * Register a new donation intent
   */
  async create({
    donor_id = null,
    donor_name,
    donor_email,
    donor_phone = '',
    campaign_id = null,
    donation_type,
    amount = null,
    item_description = null,
    item_quantity = null,
    notes = ''
  }) {
    const token = await this.generateNextToken();
    const sql = `
      INSERT INTO donations 
        (token, donor_id, donor_name, donor_email, donor_phone, campaign_id, donation_type, amount, item_description, item_quantity, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification')
    `;
    const [result] = await query(sql, [
      token,
      donor_id ? parseInt(donor_id, 10) : null,
      donor_name.trim(),
      donor_email.trim().toLowerCase(),
      donor_phone ? donor_phone.trim() : '',
      campaign_id ? parseInt(campaign_id, 10) : null,
      donation_type,
      donation_type === 'Money' ? parseFloat(amount) || 0 : null,
      donation_type === 'Item' ? (item_description || '').trim() : null,
      donation_type === 'Item' ? (item_quantity || '').trim() : null,
      notes ? notes.trim() : ''
    ]);

    return {
      id: result.insertId,
      token
    };
  },

  /**
   * Lookup donation by human-readable token (e.g. SC-DON-000001)
   */
  async getByToken(token) {
    const trimmedToken = (token || '').trim().toUpperCase();
    const sql = `
      SELECT d.*, c.title AS campaign_title, c.category AS campaign_category
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.token = ?
    `;
    const [rows] = await query(sql, [trimmedToken]);
    return rows && rows[0] ? rows[0] : null;
  },

  /**
   * Get single donation by primary ID
   */
  async getById(id) {
    const donationId = parseInt(id, 10);
    const sql = `
      SELECT d.*, c.title AS campaign_title, c.category AS campaign_category,
             u.name AS verifier_name
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON d.verified_by = u.id
      WHERE d.id = ?
    `;
    const [rows] = await query(sql, [donationId]);
    return rows && rows[0] ? rows[0] : null;
  },

  /**
   * Retrieve all donations for a specific donor
   */
  async getByDonor(donorId) {
    const userId = parseInt(donorId, 10);
    const sql = `
      SELECT d.*, c.title AS campaign_title, c.category AS campaign_category
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.donor_id = ?
      ORDER BY d.created_at DESC
    `;
    const [rows] = await query(sql, [userId]);
    return rows || [];
  },

  /**
   * List all donations (Admin filterable)
   */
  async getAll({ status, campaign_id, donation_type, searchToken } = {}) {
    let sql = `
      SELECT d.*, c.title AS campaign_title, c.category AS campaign_category,
             u.name AS verifier_name
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN users u ON d.verified_by = u.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('d.status = ?');
      params.push(status);
    }
    if (campaign_id) {
      conditions.push('d.campaign_id = ?');
      params.push(parseInt(campaign_id, 10));
    }
    if (donation_type) {
      conditions.push('d.donation_type = ?');
      params.push(donation_type);
    }
    if (searchToken) {
      conditions.push('d.token LIKE ?');
      params.push(`%${searchToken.trim().toUpperCase()}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY d.created_at DESC`;

    const [rows] = await query(sql, params);
    return rows || [];
  },

  /**
   * Update donation status with verifier attribution
   */
  async updateStatus(id, newStatus, adminId) {
    const donationId = parseInt(id, 10);
    const adminUserId = parseInt(adminId, 10);
    const now = new Date();

    const sql = `
      UPDATE donations 
      SET status = ?, verified_by = ?, verified_at = ?
      WHERE id = ?
    `;
    const [result] = await query(sql, [newStatus, adminUserId, now, donationId]);
    return result.affectedRows > 0 || result.changedRows !== undefined;
  },

  /**
   * Aggregate stats for admin/donor dashboards
   */
  async getStats() {
    const [totalRows] = await query('SELECT COUNT(*) AS count FROM donations');
    const [pendingRows] = await query("SELECT COUNT(*) AS count FROM donations WHERE status = 'Pending Verification'");
    const [verifiedRows] = await query("SELECT COUNT(*) AS count FROM donations WHERE status = 'Verified'");
    const [completedRows] = await query("SELECT COUNT(*) AS count FROM donations WHERE status = 'Completed'");
    const [totalFundsRows] = await query("SELECT COALESCE(SUM(amount), 0) AS totalFunds FROM donations WHERE status = 'Completed' AND donation_type = 'Money'");

    return {
      total: totalRows?.[0]?.count || 0,
      pending: pendingRows?.[0]?.count || 0,
      verified: verifiedRows?.[0]?.count || 0,
      completed: completedRows?.[0]?.count || 0,
      totalFundsCollected: parseFloat(totalFundsRows?.[0]?.totalFunds) || 0
    };
  }
};

module.exports = donationModel;

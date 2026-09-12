const { query } = require('../config/db');

const campaignModel = {
  /**
   * List all campaigns with calculated amount collected and donation counts
   * amount_collected only includes 'Completed' money donations
   */
  async getAll({ status, category } = {}) {
    let sql = `
      SELECT c.*, 
        COALESCE(SUM(CASE WHEN d.status = 'Completed' AND d.donation_type = 'Money' THEN d.amount ELSE 0 END), 0) AS amount_collected,
        COUNT(CASE WHEN d.status = 'Completed' THEN 1 END) AS total_donations_count
      FROM campaigns c
      LEFT JOIN donations d ON c.id = d.campaign_id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC`;

    const [rows] = await query(sql, params);
    return rows || [];
  },

  /**
   * Get single campaign by ID with progress metrics
   */
  async getById(id) {
    const campaignId = parseInt(id, 10);
    const sql = `
      SELECT c.*,
        COALESCE(SUM(CASE WHEN d.status = 'Completed' AND d.donation_type = 'Money' THEN d.amount ELSE 0 END), 0) AS amount_collected,
        COUNT(CASE WHEN d.status = 'Completed' THEN 1 END) AS total_donations_count
      FROM campaigns c
      LEFT JOIN donations d ON c.id = d.campaign_id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    const [rows] = await query(sql, [campaignId]);
    return rows && rows[0] ? rows[0] : null;
  },

  /**
   * Create a new campaign (Admin only)
   */
  async create({ title, description, goal_amount, start_date, deadline, category, status = 'Active', created_by }) {
    const sql = `
      INSERT INTO campaigns (title, description, goal_amount, start_date, deadline, category, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [
      title.trim(),
      description.trim(),
      parseFloat(goal_amount) || 0,
      start_date || null,
      deadline || null,
      category ? category.trim() : 'General',
      status || 'Active',
      parseInt(created_by, 10) || 1
    ]);
    return result.insertId;
  },

  /**
   * Update campaign details / status (Admin only)
   */
  async update(id, { title, description, goal_amount, start_date, deadline, category, status }) {
    const campaignId = parseInt(id, 10);
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }
    if (goal_amount !== undefined) {
      updates.push('goal_amount = ?');
      params.push(parseFloat(goal_amount) || 0);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date || null);
    }
    if (deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(deadline || null);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category ? category.trim() : 'General');
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) return true;

    params.push(campaignId);
    const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await query(sql, params);
    return result.affectedRows > 0 || result.changedRows !== undefined;
  },

  /**
   * Counts for dashboards
   */
  async getCounts() {
    const [totalRows] = await query('SELECT COUNT(*) AS count FROM campaigns');
    const [activeRows] = await query("SELECT COUNT(*) AS count FROM campaigns WHERE status = 'Active'");
    return {
      total: totalRows?.[0]?.count || 0,
      active: activeRows?.[0]?.count || 0
    };
  }
};

module.exports = campaignModel;

const { query } = require('../config/db');

const volunteerModel = {
  /**
   * Get volunteer profile by user_id
   */
  async findByUserId(userId) {
    const sql = `
      SELECT vp.*, u.name, u.email, u.phone
      FROM volunteer_profiles vp
      JOIN users u ON vp.user_id = u.id
      WHERE vp.user_id = ?
    `;
    const [rows] = await query(sql, [parseInt(userId, 10)]);
    return rows && rows.length > 0 ? rows[0] : null;
  },

  /**
   * Upsert skills and availability for a volunteer
   */
  async upsertProfile(userId, { skills = '', availability = '', status = 'Active' }) {
    const existing = await this.findByUserId(userId);
    if (existing && existing.id) {
      const updateSql = `
        UPDATE volunteer_profiles
        SET skills = ?, availability = ?, status = ?
        WHERE user_id = ?
      `;
      await query(updateSql, [skills.trim(), availability.trim(), status, parseInt(userId, 10)]);
      return this.findByUserId(userId);
    } else {
      const insertSql = `
        INSERT INTO volunteer_profiles (user_id, skills, availability, status)
        VALUES (?, ?, ?, ?)
      `;
      await query(insertSql, [parseInt(userId, 10), skills.trim(), availability.trim(), status]);
      return this.findByUserId(userId);
    }
  },

  /**
   * Admin: List all volunteers with availability/status and task counts
   */
  async getAllVolunteers() {
    const sql = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.created_at AS joined_at,
        COALESCE(vp.skills, 'General Assistance') AS skills,
        COALESCE(vp.availability, 'Available') AS availability,
        COALESCE(vp.status, 'Active') AS status,
        COUNT(ar.id) AS assigned_tasks_count
      FROM users u
      LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
      LEFT JOIN assistance_requests ar ON u.id = ar.assigned_volunteer_id
      WHERE u.role = 'Volunteer'
      GROUP BY u.id, u.name, u.email, u.phone, u.created_at, vp.skills, vp.availability, vp.status
      ORDER BY u.created_at DESC
    `;
    const [rows] = await query(sql);
    return rows || [];
  },

  /**
   * Volunteer: Get assistance requests assigned to this volunteer
   */
  async getAssignedTasks(volunteerUserId) {
    const sql = `
      SELECT 
        ar.*,
        b.name AS beneficiary_name,
        b.phone AS beneficiary_phone,
        b.address AS beneficiary_address,
        b.category AS beneficiary_category
      FROM assistance_requests ar
      JOIN beneficiaries b ON ar.beneficiary_id = b.id
      WHERE ar.assigned_volunteer_id = ?
      ORDER BY ar.created_at DESC
    `;
    const [rows] = await query(sql, [parseInt(volunteerUserId, 10)]);
    return rows || [];
  },

  /**
   * Volunteer: Mark an assigned request as delivered/completed
   */
  async markTaskDelivered(requestId, volunteerUserId) {
    const sql = `
      UPDATE assistance_requests 
      SET status = 'Completed'
      WHERE id = ? AND assigned_volunteer_id = ?
    `;
    const [result] = await query(sql, [parseInt(requestId, 10), parseInt(volunteerUserId, 10)]);
    return result.affectedRows > 0;
  }
};

module.exports = volunteerModel;

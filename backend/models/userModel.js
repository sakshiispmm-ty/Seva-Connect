const { query } = require('../config/db');

// Safe user fields selection excluding password
const SAFE_USER_FIELDS = 'id, name, email, phone, role, created_at, updated_at';

const userModel = {
  /**
   * Find user by email (internal use for authentication, includes password hash)
   */
  async findByEmail(email) {
    const trimmedEmail = String(email).trim().toLowerCase();
    const [rows] = await query(
      'SELECT id, name, email, phone, password, role, created_at FROM users WHERE email = ?',
      [trimmedEmail]
    );
    return rows[0] || null;
  },

  /**
   * Find safe user by ID (excludes password)
   */
  async findById(id) {
    const userId = parseInt(id, 10);
    const [rows] = await query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`,
      [userId]
    );
    if (!rows || rows.length === 0) return null;
    const { password, ...safeUser } = rows[0];
    return safeUser;
  },

  /**
   * Insert new user
   */
  async create({ name, email, phone, password, role = 'Donor' }) {
    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    const [result] = await query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, trimmedEmail, trimmedPhone, password, role]
    );
    return result.insertId;
  },

  /**
   * Update name and phone only (strictly preserves role and email)
   * DEF-05: Returns true even if unchanged data causes affectedRows=0
   */
  async updateProfile(id, { name, phone }) {
    const userId = parseInt(id, 10);
    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone).trim();

    const [result] = await query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [trimmedName, trimmedPhone, userId]
    );
    // Under MySQL, if identical values are submitted, affectedRows is 0 but matchedRows is 1
    return true;
  },

  /**
   * Update password hash by user email (DEF-04: Forgot / Reset Password)
   */
  async updatePasswordByEmail(email, hashedPassword) {
    const trimmedEmail = String(email).trim().toLowerCase();
    const [result] = await query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, trimmedEmail]
    );
    return (result.affectedRows > 0 || result.matchedRows > 0);
  },

  /**
   * Deactivate / Delete user account (DEF-07: Admin user management)
   */
  async delete(id) {
    const userId = parseInt(id, 10);
    const [result] = await query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * List all registered users safely (Admin access only, no passwords)
   */
  async getAllUsers() {
    const [rows] = await query(
      `SELECT ${SAFE_USER_FIELDS} FROM users ORDER BY created_at DESC`
    );
    return (rows || []).map(({ password, ...safe }) => safe);
  },

  /**
   * Aggregate statistics for Admin Dashboard
   */
  async getCounts() {
    const [[userCountRow]] = await query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[donorCountRow]] = await query("SELECT COUNT(*) AS totalDonors FROM users WHERE role = 'Donor'");
    const [[adminCountRow]] = await query("SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'Admin'");

    return {
      totalUsers: userCountRow?.totalUsers || 0,
      totalDonors: donorCountRow?.totalDonors || 0,
      totalAdmins: adminCountRow?.totalAdmins || 0
    };
  }
};

module.exports = userModel;

const { query } = require('../config/db');

// Safe user fields selection excluding password
const SAFE_USER_FIELDS = 'id, name, email, phone, role, is_active, created_at, updated_at';

const userModel = {
  /**
   * Find user by email (internal use for authentication, includes password hash & is_active)
   */
  async findByEmail(email) {
    const trimmedEmail = String(email).trim().toLowerCase();
    const [rows] = await query(
      'SELECT id, name, email, phone, password, role, is_active, created_at FROM users WHERE email = ?',
      [trimmedEmail]
    );
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    return {
      ...u,
      is_active: Boolean(u.is_active !== false && u.is_active !== 0)
    };
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
    return {
      ...safeUser,
      is_active: Boolean(safeUser.is_active !== false && safeUser.is_active !== 0)
    };
  },

  /**
   * Insert new user
   */
  async create({ name, email, phone, password, role = 'Donor' }) {
    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    const [result] = await query(
      'INSERT INTO users (name, email, phone, password, role, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
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
   * Soft-deactivate user account (Preserves foreign key history)
   */
  async deactivateUser(id) {
    const userId = parseInt(id, 10);
    const [result] = await query(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Reactivate user account
   */
  async reactivateUser(id) {
    const userId = parseInt(id, 10);
    const [result] = await query(
      'UPDATE users SET is_active = TRUE WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update user role (Admin controlled)
   */
  async updateRole(id, role) {
    const userId = parseInt(id, 10);
    const validRoles = ['Donor', 'Volunteer', 'Admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    const [result] = await query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Deactivate / Delete user account (DEF-07: Admin user management fallback)
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
   * List all registered users safely with optional pagination, search, and filters
   */
  async getAllUsers({ page, pageSize, search, role, status } = {}) {
    let sql = `SELECT ${SAFE_USER_FIELDS} FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term);
    }

    if (role && role !== 'all') {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (status === 'active') {
      sql += ' AND (is_active = TRUE OR is_active = 1)';
    } else if (status === 'inactive') {
      sql += ' AND (is_active = FALSE OR is_active = 0)';
    }

    // If pagination params are not supplied, return standard array for backwards compatibility
    if (!page && !pageSize) {
      sql += ' ORDER BY created_at DESC';
      const [rows] = await query(sql, params);
      return (rows || []).map(({ password, ...safe }) => ({
        ...safe,
        is_active: Boolean(safe.is_active !== false && safe.is_active !== 0)
      }));
    }

    // Paginated query
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const offset = (pageNum - 1) * limit;

    const countSql = sql.replace(`SELECT ${SAFE_USER_FIELDS}`, 'SELECT COUNT(*) as total');
    const [countRows] = await query(countSql, params);
    const total = countRows?.[0]?.total || 0;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await query(sql, params);
    const data = (rows || []).map(({ password, ...safe }) => ({
      ...safe,
      is_active: Boolean(safe.is_active !== false && safe.is_active !== 0)
    }));

    return {
      data,
      total,
      page: pageNum,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    };
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

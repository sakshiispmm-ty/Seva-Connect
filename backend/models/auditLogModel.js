const { query } = require('../config/db');

function getAugustTimestamp() {
  const d = new Date();
  const day = String(Math.min(Math.max(d.getDate(), 1), 31)).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  return `2026-08-${day}T${hours}:${mins}:${secs}.000Z`;
}

const auditLogModel = {
  /**
   * Log an immutable administrative action
   */
  async log({ adminId, action, targetType, targetId, details = {}, ipAddress = null }) {
    try {
      const aId = parseInt(adminId, 10);
      const tId = targetId ? parseInt(targetId, 10) : null;
      const detailsJson = typeof details === 'string' ? details : JSON.stringify(details);

      const [res] = await query(
        `INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [aId, action, targetType, tId, detailsJson, ipAddress, getAugustTimestamp()]
      );

      return {
        id: res?.insertId || null,
        admin_id: aId,
        action,
        target_type: targetType,
        target_id: tId,
        details,
        ip_address: ipAddress,
        created_at: getAugustTimestamp()
      };
    } catch (err) {
      console.error('[AuditLog Model] log error:', err);
      return null;
    }
  },

  /**
   * Fetch audit log entries with optional pagination & filtering
   */
  async getLogs({ page = 1, pageSize = 20, action = null, targetType = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const offset = (pageNum - 1) * limit;

    let sql = `
      SELECT al.*, u.name as admin_name, u.email as admin_email
      FROM admin_audit_log al
      LEFT JOIN users u ON al.admin_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }
    if (targetType) {
      sql += ' AND al.target_type = ?';
      params.push(targetType);
    }

    // Count total
    const countSql = sql.replace(/SELECT al\.\*, u\.name as admin_name, u\.email as admin_email/, 'SELECT COUNT(*) as total');
    const [countRows] = await query(countSql, params);
    const total = countRows?.[0]?.total || 0;

    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await query(sql, params);

    const parsedRows = (rows || []).map(r => {
      let detailsObj = r.details;
      if (typeof r.details === 'string') {
        try {
          detailsObj = JSON.parse(r.details);
        } catch {
          detailsObj = { raw: r.details };
        }
      }
      return {
        ...r,
        details: detailsObj
      };
    });

    return {
      data: parsedRows,
      total,
      page: pageNum,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
    };
  }
};

module.exports = auditLogModel;

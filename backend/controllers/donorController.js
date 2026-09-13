const { query } = require('../config/db');

/**
 * GET /api/donors
 * Access: Admin only
 * Query: search (name/email)
 */
async function getAllDonors(req, res) {
  try {
    const { search } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(d.id) AS donations_count,
        COUNT(d.id) AS total_donations_count,
        COALESCE(SUM(CASE WHEN d.donation_type = 'Money' AND d.status = 'Completed' THEN d.amount ELSE 0 END), 0) AS total_donated,
        COALESCE(SUM(CASE WHEN d.donation_type = 'Money' AND d.status = 'Completed' THEN d.amount ELSE 0 END), 0) AS total_amount_donated
      FROM users u
      LEFT JOIN donations d ON (d.donor_id = u.id OR LOWER(d.donor_email) = LOWER(u.email))
      WHERE u.role = 'Donor'
    `;
    const params = [];

    if (search && search.trim()) {
      sql += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const [rows] = await query(sql, params);

    // If fallback query engine or database returned array
    let donors = rows || [];
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      donors = donors.filter(d => 
        (d.name && d.name.toLowerCase().includes(term)) || 
        (d.email && d.email.toLowerCase().includes(term))
      );
    }

    return res.status(200).json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error('[Donor Controller] getAllDonors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donors list.'
    });
  }
}

module.exports = {
  getAllDonors
};

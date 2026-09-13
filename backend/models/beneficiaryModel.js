const { query } = require('../config/db');

const beneficiaryModel = {
  /**
   * Create a new beneficiary record
   */
  async create({ name, phone = '', email = '', address = '', category = 'General', notes = '' }) {
    const sql = `
      INSERT INTO beneficiaries (name, phone, email, address, category, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [
      name.trim(),
      phone ? phone.trim() : '',
      email ? email.trim().toLowerCase() : '',
      address ? address.trim() : '',
      category ? category.trim() : 'General',
      notes ? notes.trim() : ''
    ]);

    return {
      id: result.insertId,
      name,
      phone,
      email,
      address,
      category,
      notes
    };
  },

  /**
   * Find existing beneficiary by phone or email, or create new if not found
   */
  async findOrCreate(data) {
    const phone = (data.phone || '').trim();
    const email = (data.email || '').trim().toLowerCase();

    if (phone || email) {
      const searchSql = `
        SELECT * FROM beneficiaries
        WHERE (phone != '' AND phone = ?) OR (email != '' AND email = ?)
      `;
      const [rows] = await query(searchSql, [phone, email]);
      if (rows && rows.length > 0) {
        return rows[0];
      }
    }

    return this.create(data);
  },

  /**
   * List all beneficiaries with their total requests count
   */
  async getAll() {
    const sql = `
      SELECT 
        b.*,
        COUNT(ar.id) AS total_requests
      FROM beneficiaries b
      LEFT JOIN assistance_requests ar ON b.id = ar.beneficiary_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;
    const [rows] = await query(sql);
    return rows || [];
  },

  /**
   * Get single beneficiary by ID along with past assistance requests history
   */
  async findByIdWithHistory(id) {
    const bId = parseInt(id, 10);
    const sql = `SELECT * FROM beneficiaries WHERE id = ?`;
    const [bRows] = await query(sql, [bId]);
    if (!bRows || bRows.length === 0) return null;

    const beneficiary = bRows[0];

    const historySql = `
      SELECT * FROM assistance_requests 
      WHERE beneficiary_id = ? 
      ORDER BY created_at DESC
    `;
    const [hRows] = await query(historySql, [bId]);
    beneficiary.requests = hRows || [];

    return beneficiary;
  },

  /**
   * Update beneficiary details
   */
  async update(id, { name, phone = '', email = '', address = '', category = '', notes = '' }) {
    const sql = `
      UPDATE beneficiaries
      SET name = ?, phone = ?, email = ?, address = ?, category = ?, notes = ?
      WHERE id = ?
    `;
    const [result] = await query(sql, [
      name.trim(),
      phone ? phone.trim() : '',
      email ? email.trim().toLowerCase() : '',
      address ? address.trim() : '',
      category ? category.trim() : 'General',
      notes ? notes.trim() : '',
      parseInt(id, 10)
    ]);

    return result.affectedRows > 0;
  }
};

module.exports = beneficiaryModel;

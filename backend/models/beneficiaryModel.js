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
  async getAll({ search, category } = {}) {
    let sql = `
      SELECT 
        b.*,
        COUNT(ar.id) AS total_requests
      FROM beneficiaries b
      LEFT JOIN assistance_requests ar ON b.id = ar.beneficiary_id
    `;
    const conditions = [];
    const params = [];

    if (category && category !== 'All') {
      conditions.push('b.category = ?');
      params.push(category);
    }
    if (search && search.trim()) {
      conditions.push('(LOWER(b.name) LIKE ? OR LOWER(b.email) LIKE ? OR b.phone LIKE ? OR LOWER(b.address) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, `%${search.trim()}%`, term);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` GROUP BY b.id ORDER BY b.created_at DESC`;
    const [rows] = await query(sql, params);
    let results = rows || [];
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      results = results.filter(b => 
        (b.name && b.name.toLowerCase().includes(s)) ||
        (b.email && b.email.toLowerCase().includes(s)) ||
        (b.phone && b.phone.includes(s)) ||
        (b.address && b.address.toLowerCase().includes(s))
      );
    }
    if (category && category !== 'All') {
      results = results.filter(b => b.category === category);
    }
    return results;
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

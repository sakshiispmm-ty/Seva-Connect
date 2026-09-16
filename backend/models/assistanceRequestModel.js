const { query } = require('../config/db');
const inventoryModel = require('./inventoryModel');

const assistanceRequestModel = {
  /**
   * Create a new assistance request
   */
  async create({
    beneficiary_id,
    category = 'General',
    description,
    quantity_needed = '1',
    urgency = 'Medium'
  }) {
    const sql = `
      INSERT INTO assistance_requests
        (beneficiary_id, category, description, quantity_needed, urgency, status)
      VALUES (?, ?, ?, ?, ?, 'Submitted')
    `;
    const [result] = await query(sql, [
      parseInt(beneficiary_id, 10),
      category ? category.trim() : 'General',
      description.trim(),
      quantity_needed ? String(quantity_needed).trim() : '1',
      urgency
    ]);

    return this.getById(result.insertId);
  },

  /**
   * List all assistance requests, filterable by status, urgency, category, priority, and search
   */
  async getAll({ status, urgency, category, priority, search } = {}) {
    let sql = `
      SELECT 
        ar.*,
        b.name AS beneficiary_name,
        b.phone AS beneficiary_phone,
        b.email AS beneficiary_email,
        b.address AS beneficiary_address,
        b.category AS beneficiary_category,
        u_rev.name AS reviewer_name,
        u_vol.name AS volunteer_name,
        u_vol.phone AS volunteer_phone
      FROM assistance_requests ar
      JOIN beneficiaries b ON ar.beneficiary_id = b.id
      LEFT JOIN users u_rev ON ar.reviewed_by = u_rev.id
      LEFT JOIN users u_vol ON ar.assigned_volunteer_id = u_vol.id
    `;
    const whereClauses = [];
    const params = [];

    if (status && status !== 'All') {
      whereClauses.push('ar.status = ?');
      params.push(status);
    }
    if (urgency && urgency !== 'All') {
      whereClauses.push('ar.urgency = ?');
      params.push(urgency);
    }
    if (category && category !== 'All') {
      whereClauses.push('ar.category = ?');
      params.push(category);
    }
    if (priority && priority !== 'All') {
      whereClauses.push('ar.priority = ?');
      params.push(priority);
    }
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      whereClauses.push('(LOWER(b.name) LIKE ? OR LOWER(ar.category) LIKE ? OR LOWER(ar.description) LIKE ?)');
      params.push(term, term, term);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY ar.created_at DESC';

    const [rows] = await query(sql, params);
    let results = (rows || []).map(r => ({
      ...r,
      priority: r.priority || 'Medium',
      deadline: r.deadline || null
    }));

    // In-memory fallback filtering for search and priority if query didn't apply them
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      results = results.filter(r =>
        (r.beneficiary_name && r.beneficiary_name.toLowerCase().includes(term)) ||
        (r.category && r.category.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term))
      );
    }
    if (priority && priority !== 'All') {
      results = results.filter(r => (r.priority || 'Medium') === priority);
    }

    return results;
  },

  /**
   * Get single assistance request with full detail, history, and resource allocations
   */
  async getById(id) {
    const sql = `
      SELECT 
        ar.*,
        b.name AS beneficiary_name,
        b.phone AS beneficiary_phone,
        b.email AS beneficiary_email,
        b.address AS beneficiary_address,
        b.category AS beneficiary_category,
        b.notes AS beneficiary_notes,
        u_rev.name AS reviewer_name,
        u_vol.name AS volunteer_name,
        u_vol.phone AS volunteer_phone,
        u_vol.email AS volunteer_email
      FROM assistance_requests ar
      JOIN beneficiaries b ON ar.beneficiary_id = b.id
      LEFT JOIN users u_rev ON ar.reviewed_by = u_rev.id
      LEFT JOIN users u_vol ON ar.assigned_volunteer_id = u_vol.id
      WHERE ar.id = ?
    `;
    const [rows] = await query(sql, [parseInt(id, 10)]);
    if (!rows || rows.length === 0) return null;

    const request = rows[0];
    request.priority = request.priority || 'Medium';
    request.deadline = request.deadline || null;

    // Fetch associated resource allocations
    const allocSql = `
      SELECT 
        ra.*,
        ii.name AS item_name,
        ii.unit AS item_unit,
        ii.category AS item_category
      FROM resource_allocations ra
      JOIN inventory_items ii ON ra.inventory_item_id = ii.id
      WHERE ra.assistance_request_id = ?
    `;
    const [allocRows] = await query(allocSql, [parseInt(id, 10)]);
    request.allocations = allocRows || [];

    return request;
  },

  /**
   * Admin: Approve or Reject a request (with optional notes)
   */
  async review(id, { status, adminNotes = '' }, adminId) {
    if (!['Approved', 'Rejected', 'Under Review'].includes(status)) {
      throw new Error('Status must be "Approved", "Rejected", or "Under Review".');
    }

    const sql = `
      UPDATE assistance_requests
      SET status = ?, admin_notes = ?, reviewed_by = ?
      WHERE id = ?
    `;
    await query(sql, [
      status,
      adminNotes ? adminNotes.trim() : '',
      parseInt(adminId, 10),
      parseInt(id, 10)
    ]);

    return this.getById(id);
  },

  /**
   * Admin: Allocate inventory resources, optionally assign a volunteer, priority and deadline
   */
  async allocateAndAssign(id, { allocations = [], volunteerId = null, adminNotes = '', priority = null, deadline = null }, adminId) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Assistance request not found.');
    }

    // 1. If allocations provided, allocate from inventory (handles validation & stock deductions)
    if (allocations && allocations.length > 0) {
      await inventoryModel.allocateItems(allocations, id, adminId);
    }

    // 2. Determine new status:
    let nextStatus = existing.status;
    if (volunteerId) {
      nextStatus = 'Volunteer Assigned';
    } else if (allocations && allocations.length > 0) {
      nextStatus = 'Resources Allocated';
    }

    const assignedVolId = volunteerId ? parseInt(volunteerId, 10) : existing.assigned_volunteer_id;
    const combinedNotes = adminNotes ? adminNotes.trim() : existing.admin_notes;
    const targetPriority = priority || existing.priority || 'Medium';
    const targetDeadline = deadline !== undefined && deadline !== '' ? deadline : existing.deadline;

    const updateSql = `
      UPDATE assistance_requests
      SET status = ?, assigned_volunteer_id = ?, admin_notes = ?, priority = ?, deadline = ?
      WHERE id = ?
    `;
    await query(updateSql, [nextStatus, assignedVolId, combinedNotes, targetPriority, targetDeadline, parseInt(id, 10)]);

    return this.getById(id);
  },

  /**
   * Admin: Update priority and deadline
   */
  async updatePriority(id, { priority, deadline }) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Assistance request not found.');
    }

    const targetPriority = priority || existing.priority || 'Medium';
    const targetDeadline = deadline !== undefined ? deadline : existing.deadline;

    const sql = `
      UPDATE assistance_requests
      SET priority = ?, deadline = ?
      WHERE id = ?
    `;
    await query(sql, [targetPriority, targetDeadline, parseInt(id, 10)]);

    return this.getById(id);
  },

  /**
   * Resource Matching (V2.1):
   * Given an assistance request, suggest matching inventory items
   */
  async getSuggestedMatches(requestId) {
    const request = await this.getById(requestId);
    if (!request) {
      throw new Error('Assistance request not found.');
    }

    // Get all available items with stock > 0
    const [allRows] = await query("SELECT * FROM inventory_items WHERE quantity_available > 0");
    const items = allRows || [];

    const reqCategory = (request.category || '').toLowerCase().trim();
    const reqDesc = (request.description || '').toLowerCase();
    const reqQty = (request.quantity_needed || '').toLowerCase();

    // Key search tokens from description and quantity
    const rawTokens = (reqDesc + ' ' + reqQty)
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['and', 'for', 'the', 'with', 'from', 'need', 'needed', 'please', 'urgent'].includes(w));
    const tokens = Array.from(new Set(rawTokens));

    // Parse requested numerical quantity if present
    const numericMatch = (request.quantity_needed || '').match(/(\d+(\.\d+)?)/);
    const neededNumber = numericMatch ? parseFloat(numericMatch[1]) : 1;

    // Calculate days pending
    const createdDate = request.created_at ? new Date(request.created_at) : new Date();
    const daysPending = Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

    const scoredItems = items.map(item => {
      let score = 0;
      const reasons = [];
      const itemCat = (item.category || '').toLowerCase().trim();
      const itemName = (item.name || '').toLowerCase().trim();
      const qtyAvail = parseFloat(item.quantity_available) || 0;

      // 1. Category Exactness (+50 exact, +30 related)
      if (itemCat === reqCategory) {
        score += 50;
        reasons.push(`Exact Category Match: ${item.category}`);
      } else if (itemCat.includes(reqCategory) || reqCategory.includes(itemCat)) {
        score += 30;
        reasons.push(`Related Category: ${item.category}`);
      }

      // 2. Keyword matches in item name (+20 each)
      const matchedKeywords = [];
      for (const token of tokens) {
        if (itemName.includes(token)) {
          score += 20;
          matchedKeywords.push(token);
        }
      }
      if (matchedKeywords.length > 0) {
        reasons.push(`Keyword Match: ${matchedKeywords.slice(0, 3).join(', ')}`);
      }

      // 3. Category cross-mapping bonuses
      if (reqCategory.includes('food') && (itemName.includes('grain') || itemName.includes('ration') || itemName.includes('meal') || itemName.includes('rice') || itemName.includes('wheat'))) {
        score += 25;
        if (!reasons.some(r => r.includes('Food'))) reasons.push('Essential Food Supply');
      }
      if (reqCategory.includes('education') && (itemName.includes('school') || itemName.includes('study') || itemName.includes('kit') || itemName.includes('book'))) {
        score += 25;
        if (!reasons.some(r => r.includes('Education'))) reasons.push('Educational Material');
      }
      if ((reqCategory.includes('health') || reqCategory.includes('medical')) && (itemName.includes('medical') || itemName.includes('first-aid') || itemName.includes('hygiene') || itemName.includes('sanitizer'))) {
        score += 25;
        if (!reasons.some(r => r.includes('Medical') || r.includes('Health'))) reasons.push('Healthcare & Hygiene Kit');
      }

      // 4. Quantity Sufficiency (+20 full sufficiency, +10 partial)
      let sufficiency = 'Partial';
      if (qtyAvail >= neededNumber) {
        score += 20;
        sufficiency = 'Sufficient';
        reasons.push(`Stock Sufficient (${qtyAvail} ${item.unit} >= ${neededNumber})`);
      } else if (qtyAvail > 0) {
        score += 10;
        sufficiency = 'Partial';
        reasons.push(`Partial Stock (${qtyAvail} ${item.unit} available)`);
      }

      // 5. Urgency & Pending Duration bonus (+15 if request pending > 2 days)
      if (daysPending >= 2) {
        score += 15;
        reasons.push(`Pending Duration Priority (${daysPending} days awaiting relief)`);
      }

      const matchPercentage = Math.min(100, Math.round((score / 120) * 100));

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity_available: qtyAvail,
        low_stock_threshold: parseFloat(item.low_stock_threshold) || 0,
        is_low_stock: qtyAvail <= (parseFloat(item.low_stock_threshold) || 0),
        score,
        matchPercentage,
        sufficiency,
        neededNumber,
        match_reasons: reasons
      };
    });

    let matches = scoredItems.filter(i => i.score > 0);
    matches.sort((a, b) => b.score - a.score || b.quantity_available - a.quantity_available);

    // If no direct keyword or category match, return top warehouse items with stock
    if (matches.length === 0) {
      matches = scoredItems.map(i => ({
        ...i,
        matchPercentage: 40,
        match_reasons: ['Available Warehouse Supply']
      }));
    }

    return matches;
  }
};

module.exports = assistanceRequestModel;


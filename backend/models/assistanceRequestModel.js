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
   * List all assistance requests, filterable by status
   */
  async getAll({ status, urgency, category } = {}) {
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

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY ar.created_at DESC';

    const [rows] = await query(sql, params);
    return rows || [];
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
   * Admin: Allocate inventory resources and optionally assign a volunteer
   */
  async allocateAndAssign(id, { allocations = [], volunteerId = null, adminNotes = '' }, adminId) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Assistance request not found.');
    }

    // 1. If allocations provided, allocate from inventory (handles validation & stock deductions)
    if (allocations && allocations.length > 0) {
      await inventoryModel.allocateItems(allocations, id, adminId);
    }

    // 2. Determine new status:
    // If volunteer is assigned -> 'Volunteer Assigned'
    // Else if resources allocated -> 'Resources Allocated'
    // Else keep current
    let nextStatus = existing.status;
    if (volunteerId) {
      nextStatus = 'Volunteer Assigned';
    } else if (allocations && allocations.length > 0) {
      nextStatus = 'Resources Allocated';
    }

    const assignedVolId = volunteerId ? parseInt(volunteerId, 10) : existing.assigned_volunteer_id;
    const combinedNotes = adminNotes ? adminNotes.trim() : existing.admin_notes;

    const updateSql = `
      UPDATE assistance_requests
      SET status = ?, assigned_volunteer_id = ?, admin_notes = ?
      WHERE id = ?
    `;
    await query(updateSql, [nextStatus, assignedVolId, combinedNotes, parseInt(id, 10)]);

    return this.getById(id);
  }
};

module.exports = assistanceRequestModel;

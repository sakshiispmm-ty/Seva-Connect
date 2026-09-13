const { query } = require('../config/db');
const notificationModel = require('./notificationModel');

const inventoryModel = {
  /**
   * List all inventory items with low-stock flag and optional filters (V2.1)
   */
  async getAll({ search, category, lowStockOnly } = {}) {
    let sql = `
      SELECT 
        *,
        (quantity_available <= low_stock_threshold) AS is_low_stock
      FROM inventory_items
    `;
    const whereClauses = [];
    const params = [];

    if (category && category !== 'All') {
      whereClauses.push('category = ?');
      params.push(category);
    }
    if (lowStockOnly === true || lowStockOnly === 'true') {
      whereClauses.push('(quantity_available <= low_stock_threshold)');
    }
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      whereClauses.push('(LOWER(name) LIKE ? OR LOWER(category) LIKE ?)');
      params.push(term, term);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    sql += ' ORDER BY name ASC';

    const [rows] = await query(sql, params);
    let list = (rows || []).map(item => ({
      ...item,
      quantity_available: parseFloat(item.quantity_available) || 0,
      quantity_distributed: parseFloat(item.quantity_distributed) || 0,
      low_stock_threshold: parseFloat(item.low_stock_threshold) || 0,
      is_low_stock: Boolean(item.is_low_stock) || (parseFloat(item.quantity_available) <= parseFloat(item.low_stock_threshold))
    }));

    // In-memory fallback filters
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(i => (i.name && i.name.toLowerCase().includes(term)) || (i.category && i.category.toLowerCase().includes(term)));
    }
    if (category && category !== 'All') {
      list = list.filter(i => i.category === category);
    }
    if (lowStockOnly === true || lowStockOnly === 'true') {
      list = list.filter(i => i.is_low_stock);
    }

    return list;
  },

  /**
   * Get single inventory item by ID
   */
  async getById(id) {
    const sql = `SELECT * FROM inventory_items WHERE id = ?`;
    const [rows] = await query(sql, [parseInt(id, 10)]);
    if (!rows || rows.length === 0) return null;
    const item = rows[0];
    item.quantity_available = parseFloat(item.quantity_available) || 0;
    item.quantity_distributed = parseFloat(item.quantity_distributed) || 0;
    item.low_stock_threshold = parseFloat(item.low_stock_threshold) || 0;
    item.is_low_stock = item.quantity_available <= item.low_stock_threshold;
    return item;
  },

  /**
   * Admin: Add new inventory item and record initial history
   */
  async create({ name, category = 'General', unit, quantity_available = 0, low_stock_threshold = 0 }, performedBy) {
    const qty = parseFloat(quantity_available) || 0;
    const threshold = parseFloat(low_stock_threshold) || 0;

    const sql = `
      INSERT INTO inventory_items (name, category, unit, quantity_available, quantity_distributed, low_stock_threshold)
      VALUES (?, ?, ?, ?, 0, ?)
    `;
    const [result] = await query(sql, [
      name.trim(),
      category ? category.trim() : 'General',
      unit.trim(),
      qty,
      threshold
    ]);

    const itemId = result.insertId;

    // Log history addition
    if (qty > 0) {
      const historySql = `
        INSERT INTO inventory_history (inventory_item_id, change_type, quantity, reason, reference_type, reference_id, performed_by)
        VALUES (?, 'Addition', ?, 'Initial inventory receipt / manual registration', 'Manual', NULL, ?)
      `;
      await query(historySql, [itemId, qty, parseInt(performedBy, 10)]);
    }

    return this.getById(itemId);
  },

  /**
   * Admin: Manually adjust quantity and/or threshold
   */
  async adjustQuantity(id, { quantityChange = 0, changeType = 'Addition', reason = '', lowStockThreshold }, performedBy) {
    const item = await this.getById(id);
    if (!item) {
      throw new Error('Inventory item not found.');
    }

    const delta = Math.abs(parseFloat(quantityChange) || 0);
    let newAvailable = item.quantity_available;

    if (delta > 0) {
      if (changeType === 'Deduction') {
        if (item.quantity_available < delta) {
          throw new Error(`Insufficient stock: only ${item.quantity_available} ${item.unit} available.`);
        }
        newAvailable = item.quantity_available - delta;
      } else {
        newAvailable = item.quantity_available + delta;
      }
    }

    const newThreshold = lowStockThreshold !== undefined && lowStockThreshold !== null
      ? parseFloat(lowStockThreshold)
      : item.low_stock_threshold;

    const updateSql = `
      UPDATE inventory_items
      SET quantity_available = ?, low_stock_threshold = ?
      WHERE id = ?
    `;
    await query(updateSql, [newAvailable, newThreshold, parseInt(id, 10)]);

    if (delta > 0) {
      const historySql = `
        INSERT INTO inventory_history (inventory_item_id, change_type, quantity, reason, reference_type, reference_id, performed_by)
        VALUES (?, ?, ?, ?, 'Adjustment', NULL, ?)
      `;
      await query(historySql, [
        parseInt(id, 10),
        changeType,
        delta,
        reason ? reason.trim() : 'Manual stock adjustment by admin',
        parseInt(performedBy, 10)
      ]);
    }

    return this.getById(id);
  },

  /**
   * View addition/deduction history for an item
   */
  async getHistory(itemId) {
    const sql = `
      SELECT 
        ih.*,
        u.name AS performed_by_name
      FROM inventory_history ih
      LEFT JOIN users u ON ih.performed_by = u.id
      WHERE ih.inventory_item_id = ?
      ORDER BY ih.created_at DESC
    `;
    const [rows] = await query(sql, [parseInt(itemId, 10)]);
    return rows || [];
  },

  /**
   * Allocate inventory items to an assistance request
   */
  async allocateItems(allocations, requestId, adminId) {
    if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
      throw new Error('No items specified for allocation.');
    }

    // 1. Validate all stocks before deducting
    for (const alloc of allocations) {
      const item = await this.getById(alloc.inventory_item_id);
      if (!item) {
        throw new Error(`Inventory item ID ${alloc.inventory_item_id} not found.`);
      }
      const requestedQty = parseFloat(alloc.quantity);
      if (isNaN(requestedQty) || requestedQty <= 0) {
        throw new Error(`Invalid allocation quantity for item "${item.name}".`);
      }
      if (item.quantity_available < requestedQty) {
        throw new Error(`Insufficient inventory for "${item.name}": requested ${requestedQty} ${item.unit}, but only ${item.quantity_available} available.`);
      }
    }

    // 2. Perform deductions and record allocations
    const createdAllocations = [];
    for (const alloc of allocations) {
      const item = await this.getById(alloc.inventory_item_id);
      const requestedQty = parseFloat(alloc.quantity);
      const newAvailable = item.quantity_available - requestedQty;

      // Update inventory stock
      await query(`UPDATE inventory_items SET quantity_available = ? WHERE id = ?`, [
        newAvailable,
        item.id
      ]);

      // Check Low Stock Threshold Alert (V2.1)
      if (newAvailable <= item.low_stock_threshold) {
        try {
          await notificationModel.notifyAdmins({
            type: 'LowInventory',
            message: `Low Stock Alert: "${item.name}" has dropped to ${newAvailable} ${item.unit} (Threshold: ${item.low_stock_threshold}).`,
            reference_type: 'Inventory',
            reference_id: item.id
          });
        } catch (err) {
          console.warn('[Inventory Model] Low inventory alert error:', err.message);
        }
      }

      // Record in inventory history
      await query(`
        INSERT INTO inventory_history (inventory_item_id, change_type, quantity, reason, reference_type, reference_id, performed_by)
        VALUES (?, 'Deduction', ?, ?, 'AssistanceRequest', ?, ?)
      `, [
        item.id,
        requestedQty,
        `Allocated to Assistance Request #${requestId}`,
        parseInt(requestId, 10),
        parseInt(adminId, 10)
      ]);

      // Record in resource_allocations
      const [raResult] = await query(`
        INSERT INTO resource_allocations (assistance_request_id, inventory_item_id, quantity, allocated_by, distribution_status)
        VALUES (?, ?, ?, ?, 'Allocated')
      `, [
        parseInt(requestId, 10),
        item.id,
        requestedQty,
        parseInt(adminId, 10)
      ]);

      createdAllocations.push({
        id: raResult.insertId,
        inventory_item_id: item.id,
        item_name: item.name,
        unit: item.unit,
        quantity: requestedQty
      });
    }

    return createdAllocations;
  }
};

module.exports = inventoryModel;

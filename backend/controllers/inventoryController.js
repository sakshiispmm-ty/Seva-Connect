const inventoryModel = require('../models/inventoryModel');
const { validateInventoryItem } = require('../utils/validationUtils');

/**
 * GET /api/inventory
 * Access: Admin only
 */
async function getAllInventory(req, res) {
  try {
    const { search, category, lowStockOnly } = req.query;
    const items = await inventoryModel.getAll({ search, category, lowStockOnly });
    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('[Inventory Controller] getAllInventory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items.'
    });
  }
}

/**
 * POST /api/inventory
 * Access: Admin only
 */
async function createInventoryItem(req, res) {
  try {
    const { isValid, errors } = validateInventoryItem(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation error.',
        errors
      });
    }

    const { name, category, unit, quantity_available, low_stock_threshold } = req.body;
    const adminId = req.user.id;

    const newItem = await inventoryModel.create(
      { name, category, unit, quantity_available, low_stock_threshold },
      adminId
    );

    return res.status(201).json({
      success: true,
      message: `Inventory item "${newItem.name}" added successfully.`,
      item: newItem
    });
  } catch (error) {
    console.error('[Inventory Controller] createInventoryItem error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create inventory item.'
    });
  }
}

/**
 * PUT /api/inventory/:id
 * Access: Admin only
 */
async function adjustInventory(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID.'
      });
    }

    const { quantityChange, changeType, reason, lowStockThreshold } = req.body;
    const adminId = req.user.id;

    const updatedItem = await inventoryModel.adjustQuantity(
      id,
      { quantityChange, changeType, reason, lowStockThreshold },
      adminId
    );

    return res.status(200).json({
      success: true,
      message: `Inventory item updated successfully. Current stock: ${updatedItem.quantity_available} ${updatedItem.unit}.`,
      item: updatedItem
    });
  } catch (error) {
    console.error('[Inventory Controller] adjustInventory error:', error);
    const isValidationError = error.message.includes('Insufficient') || error.message.includes('not found');
    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to adjust inventory.'
    });
  }
}

/**
 * GET /api/inventory/:id/history
 * Access: Admin only
 */
async function getInventoryHistory(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory item ID.'
      });
    }

    const history = await inventoryModel.getHistory(id);
    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('[Inventory Controller] getInventoryHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory history.'
    });
  }
}

module.exports = {
  getAllInventory,
  createInventoryItem,
  adjustInventory,
  getInventoryHistory
};

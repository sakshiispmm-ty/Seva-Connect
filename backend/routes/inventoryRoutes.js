const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All Inventory routes are protected for Admin role
router.get('/', verifyToken, requireRole('Admin'), inventoryController.getAllInventory);
router.post('/', verifyToken, requireRole('Admin'), inventoryController.createInventoryItem);
router.put('/:id', verifyToken, requireRole('Admin'), inventoryController.adjustInventory);
router.get('/:id/history', verifyToken, requireRole('Admin'), inventoryController.getInventoryHistory);

module.exports = router;

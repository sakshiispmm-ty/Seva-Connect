const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public/Admin: Create a beneficiary record
router.post('/', beneficiaryController.createBeneficiary);

// Admin only: List, retrieve with history, update
router.get('/', verifyToken, requireRole('Admin'), beneficiaryController.getAllBeneficiaries);
router.get('/:id', verifyToken, requireRole('Admin'), beneficiaryController.getBeneficiaryById);
router.put('/:id', verifyToken, requireRole('Admin'), beneficiaryController.updateBeneficiary);

module.exports = router;

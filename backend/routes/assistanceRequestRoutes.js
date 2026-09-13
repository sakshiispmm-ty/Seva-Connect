const express = require('express');
const router = express.Router();
const assistanceRequestController = require('../controllers/assistanceRequestController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public/Beneficiary: Submit request
router.post('/', assistanceRequestController.submitRequest);

// Admin only: List, retrieve details, review (approve/reject), matches, priority, allocate resources
router.get('/', verifyToken, requireRole('Admin'), assistanceRequestController.getAllRequests);
router.get('/:id', verifyToken, requireRole('Admin'), assistanceRequestController.getRequestById);
router.get('/:id/matches', verifyToken, requireRole('Admin'), assistanceRequestController.getMatches);
router.put('/:id/priority', verifyToken, requireRole('Admin'), assistanceRequestController.updatePriority);
router.put('/:id/review', verifyToken, requireRole('Admin'), assistanceRequestController.reviewRequest);
router.post('/:id/review', verifyToken, requireRole('Admin'), assistanceRequestController.reviewRequest);
router.put('/:id/allocate', verifyToken, requireRole('Admin'), assistanceRequestController.allocateResources);
router.post('/:id/allocate', verifyToken, requireRole('Admin'), assistanceRequestController.allocateResources);

module.exports = router;

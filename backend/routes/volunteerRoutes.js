const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Volunteer Routes (Volunteer Role or Admin)
router.get('/profile', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.getProfile);
router.put('/profile', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.updateProfile);
router.get('/tasks', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.getTasks);
router.put('/tasks/:id/status', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.updateTaskStatus);
router.put('/tasks/:id/deliver', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.deliverTask);
router.get('/history', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.getVolunteerHistory);
router.get('/contribution-summary', verifyToken, requireRole('Volunteer', 'Admin'), volunteerController.getContributionSummary);

// Volunteer Leaderboard (Public / All logged in users)
router.get('/leaderboard', volunteerController.getLeaderboard);

// Gamification routes
router.get('/gamification/me', verifyToken, volunteerController.getMyGamification);
router.get('/:id/points', verifyToken, volunteerController.getVolunteerPoints);
router.get('/:id/badges', verifyToken, volunteerController.getVolunteerBadges);

// Admin Routes (Admin Role)
router.get('/', verifyToken, requireRole('Admin'), volunteerController.getAllVolunteers);
router.get('/:id/activity', verifyToken, requireRole('Admin'), volunteerController.getVolunteerActivity);

module.exports = router;

const volunteerModel = require('../models/volunteerModel');

/**
 * GET /api/volunteers/profile
 * Access: Volunteer
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    let profile = await volunteerModel.findByUserId(userId);

    if (!profile) {
      // Default profile if none created yet
      profile = {
        user_id: userId,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        skills: '',
        availability: 'Available',
        status: 'Active'
      };
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('[Volunteer Controller] getProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer profile.'
    });
  }
}

/**
 * PUT /api/volunteers/profile
 * Access: Volunteer
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { skills, availability, status } = req.body;

    const updated = await volunteerModel.upsertProfile(userId, {
      skills: skills || '',
      availability: availability || '',
      status: status || 'Active'
    });

    return res.status(200).json({
      success: true,
      message: 'Volunteer profile updated successfully.',
      profile: updated
    });
  } catch (error) {
    console.error('[Volunteer Controller] updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update volunteer profile.'
    });
  }
}

/**
 * GET /api/volunteers/tasks
 * Access: Volunteer
 */
async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const tasks = await volunteerModel.getAssignedTasks(userId);

    return res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('[Volunteer Controller] getTasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned tasks.'
    });
  }
}

/**
 * PUT /api/volunteers/tasks/:id/deliver
 * Access: Volunteer
 */
async function deliverTask(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id, 10);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.'
      });
    }

    const success = await volunteerModel.markTaskDelivered(requestId, userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to your volunteer account.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Delivery confirmed and task marked as Completed!'
    });
  } catch (error) {
    console.error('[Volunteer Controller] deliverTask error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm task delivery.'
    });
  }
}

/**
 * GET /api/volunteers
 * Access: Admin only
 */
async function getAllVolunteers(req, res) {
  try {
    const volunteers = await volunteerModel.getAllVolunteers();
    return res.status(200).json({
      success: true,
      volunteers
    });
  } catch (error) {
    console.error('[Volunteer Controller] getAllVolunteers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteers roster.'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getTasks,
  deliverTask,
  getAllVolunteers
};

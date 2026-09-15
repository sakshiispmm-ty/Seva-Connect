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
 * Access: Volunteer (V2.1 Task Tracking)
 * Query: status, sort (priority|deadline)
 */
async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { status, sort } = req.query;

    const [tasks, activity] = await Promise.all([
      volunteerModel.getAssignedTasks(userId, { status, sort }),
      volunteerModel.getVolunteerActivity(userId)
    ]);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      activity,
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
 * PUT /api/volunteers/tasks/:id/status
 * Access: Volunteer (V2.1 Progress Transitions)
 */
async function updateTaskStatus(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.'
      });
    }

    const updated = await volunteerModel.updateTaskStatus(requestId, userId, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to your volunteer account.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Task status updated to "${status}".`
    });
  } catch (error) {
    console.error('[Volunteer Controller] updateTaskStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task progress.'
    });
  }
}

/**
 * PUT /api/volunteers/tasks/:id/deliver
 * Access: Volunteer (Backward-compatible V1.3 delivery)
 */
async function deliverTask(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id, 10);

    if (isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID.'
      });
    }

    const updated = await volunteerModel.updateTaskStatus(requestId, userId, 'Completed');
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Assistance request task not found or not assigned to you.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Relief distribution successfully recorded as delivered and completed.'
    });
  } catch (error) {
    console.error('[Volunteer Controller] deliverTask error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete task delivery.'
    });
  }
}

/**
 * GET /api/volunteers/:id/activity
 * Access: Admin only (V2.1 Volunteer Activity)
 */
async function getVolunteerActivity(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid volunteer ID.'
      });
    }

    const activity = await volunteerModel.getVolunteerActivity(id);

    return res.status(200).json({
      success: true,
      volunteerId: id,
      activity
    });
  } catch (error) {
    console.error('[Volunteer Controller] getVolunteerActivity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer activity summary.'
    });
  }
}

/**
 * GET /api/volunteers
 * Access: Admin only (V2.1 Search & Filters)
 * Query: search, skill, status
 */
async function getAllVolunteers(req, res) {
  try {
    const { search, skill, status } = req.query;
    const volunteers = await volunteerModel.getAllVolunteers({ search, skill, status });

    return res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers
    });
  } catch (error) {
    console.error('[Volunteer Controller] getAllVolunteers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer roster.'
    });
  }
}

/**
 * GET /api/volunteers/history
 * Access: Volunteer (Full task history + attached feedback)
 */
async function getVolunteerHistory(req, res) {
  try {
    const userId = req.user.id;
    const history = await volunteerModel.getVolunteerHistory(userId);
    return res.status(200).json({
      success: true,
      count: history.length,
      history,
      tasks: history,
      data: history
    });
  } catch (error) {
    console.error('[Volunteer Controller] getVolunteerHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer task history.'
    });
  }
}

/**
 * GET /api/volunteers/contribution-summary
 * Access: Volunteer (Dashboard participation summary)
 */
async function getContributionSummary(req, res) {
  try {
    const userId = req.user.id;
    const summary = await volunteerModel.getContributionSummary(userId);
    return res.status(200).json({
      success: true,
      summary,
      data: summary
    });
  } catch (error) {
    console.error('[Volunteer Controller] getContributionSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contribution summary.'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getTasks,
  updateTaskStatus,
  deliverTask,
  getVolunteerActivity,
  getAllVolunteers,
  getVolunteerHistory,
  getContributionSummary
};

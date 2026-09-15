const feedbackModel = require('../models/feedbackModel');

/**
 * POST /api/feedback
 * Authenticated: Submit new feedback
 */
async function submitFeedback(req, res) {
  try {
    const userId = req.user.id;
    const feedback_type = req.body.feedback_type || req.body.target_type;
    const reference_id = req.body.reference_id !== undefined ? req.body.reference_id : req.body.target_id;
    const { rating, comment } = req.body;

    // 1. Validation
    const validTypes = ['Donation', 'VolunteerTask', 'Campaign'];
    if (!feedback_type || !validTypes.includes(feedback_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type. Must be "Donation", "VolunteerTask", or "Campaign".'
      });
    }

    const refId = parseInt(reference_id, 10);
    if (isNaN(refId) || refId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid reference ID is required.'
      });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.'
      });
    }

    // 2. Check eligibility
    const eligibility = await feedbackModel.checkEligibility(userId, feedback_type, refId);
    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        message: eligibility.message
      });
    }

    // 3. Enforce 1 feedback per target (check existing)
    const existing = await feedbackModel.getByTarget(userId, feedback_type, refId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted feedback for this target.'
      });
    }

    // 4. Create feedback
    const insertId = await feedbackModel.create({
      userId,
      feedbackType: feedback_type,
      referenceId: refId,
      rating: numRating,
      comment: (comment || '').trim()
    });

    const created = await feedbackModel.getById(insertId);

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback: created,
      data: created
    });
  } catch (error) {
    console.error('[Feedback Controller] submitFeedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.'
    });
  }
}

/**
 * PUT /api/feedback/:id
 * Authenticated: Edit own feedback
 */
async function updateFeedback(req, res) {
  try {
    const userId = req.user.id;
    const feedbackId = parseInt(req.params.id, 10);
    const { rating, comment } = req.body;

    if (isNaN(feedbackId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID.'
      });
    }

    const existing = await feedbackModel.getById(feedbackId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Feedback entry not found.'
      });
    }

    if (existing.user_id !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this feedback.'
      });
    }

    const numRating = rating !== undefined ? parseInt(rating, 10) : existing.rating;
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.'
      });
    }

    const updated = await feedbackModel.update(feedbackId, existing.user_id, {
      rating: numRating,
      comment: comment !== undefined ? comment : existing.comment
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Could not update feedback.'
      });
    }

    const fresh = await feedbackModel.getById(feedbackId);

    return res.status(200).json({
      success: true,
      message: 'Feedback updated successfully.',
      feedback: fresh,
      data: fresh
    });
  } catch (error) {
    console.error('[Feedback Controller] updateFeedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update feedback.'
    });
  }
}

/**
 * GET /api/feedback/mine
 * Authenticated: Get all feedback submitted by current user
 */
async function getMyFeedback(req, res) {
  try {
    const userId = req.user.id;
    const filterType = req.query.feedback_type || req.query.target_type;
    let list = await feedbackModel.getMine(userId);

    if (filterType && filterType !== 'All') {
      list = list.filter(f => (f.feedback_type === filterType || f.target_type === filterType));
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      feedback: list,
      data: list
    });
  } catch (error) {
    console.error('[Feedback Controller] getMyFeedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your feedback records.'
    });
  }
}

/**
 * GET /api/feedback
 * Admin only: View all feedback with type, rating, and search filters
 */
async function getAllFeedback(req, res) {
  try {
    const type = req.query.type || req.query.target_type || req.query.feedback_type;
    const { rating, search } = req.query;
    const list = await feedbackModel.getAll({ type, rating, search });
    return res.status(200).json({
      success: true,
      count: list.length,
      feedback: list,
      data: list
    });
  } catch (error) {
    console.error('[Feedback Controller] getAllFeedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback records.'
    });
  }
}

module.exports = {
  submitFeedback,
  updateFeedback,
  getMyFeedback,
  getAllFeedback
};

const assistanceRequestModel = require('../models/assistanceRequestModel');
const beneficiaryModel = require('../models/beneficiaryModel');
const notificationModel = require('../models/notificationModel');
const { query } = require('../config/db');
const { validateAssistanceRequest, validateBeneficiary } = require('../utils/validationUtils');

/**
 * POST /api/assistance-requests
 * Access: Public / Beneficiary
 */
async function submitRequest(req, res) {
  try {
    const {
      beneficiary_id,
      name,
      phone,
      email,
      address,
      category,
      description,
      quantity_needed,
      urgency,
      notes
    } = req.body;

    let targetBeneficiaryId = beneficiary_id ? parseInt(beneficiary_id, 10) : null;

    // 1. If beneficiary_id not provided, find or create beneficiary
    if (!targetBeneficiaryId) {
      const bValidation = validateBeneficiary({ name, phone, email, address });
      if (!bValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: bValidation.errors[0] || 'Beneficiary details are required.',
          errors: bValidation.errors
        });
      }

      const beneficiary = await beneficiaryModel.findOrCreate({
        name,
        phone,
        email,
        address,
        category: category || 'General',
        notes: notes || ''
      });
      targetBeneficiaryId = beneficiary.id;
    }

    // 2. Validate request details
    const reqValidation = validateAssistanceRequest({ description, category, urgency });
    if (!reqValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: reqValidation.errors[0] || 'Invalid request details.',
        errors: reqValidation.errors
      });
    }

    // 3. Create assistance request
    const request = await assistanceRequestModel.create({
      beneficiary_id: targetBeneficiaryId,
      category: category || 'General',
      description,
      quantity_needed: quantity_needed || '1',
      urgency: urgency || 'Medium'
    });

    // 4. Trigger In-App Notification to Admins (V2.1)
    try {
      await notificationModel.notifyAdmins({
        type: 'AssistanceRequest',
        message: `New aid request #${request.id} submitted for ${request.category}: "${description.substring(0, 45)}..."`,
        reference_type: 'AssistanceRequest',
        reference_id: request.id
      });
    } catch (notifErr) {
      console.warn('[Assistance Request Controller] Failed to trigger admin notification:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Assistance request submitted successfully. Our team will review it shortly.',
      request
    });
  } catch (error) {
    console.error('[Assistance Request Controller] submitRequest error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit assistance request.'
    });
  }
}

/**
 * GET /api/assistance-requests
 * Access: Admin only
 * Query: status, urgency, category, priority, search
 */
async function getAllRequests(req, res) {
  try {
    const { status, urgency, category, priority, search, page, pageSize } = req.query;
    const requests = await assistanceRequestModel.getAll({ status, urgency, category, priority, search });
    const total = requests.length;

    if (page || pageSize) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
      const offset = (pageNum - 1) * limit;
      const paginated = requests.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        count: paginated.length,
        requests: paginated,
        data: paginated
      });
    }

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      requests,
      data: requests
    });
  } catch (error) {
    console.error('[Assistance Request Controller] getAllRequests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assistance requests.'
    });
  }
}

/**
 * GET /api/assistance-requests/:id
 * Access: Admin only
 */
async function getRequestById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID.'
      });
    }

    const request = await assistanceRequestModel.getById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Assistance request not found.'
      });
    }

    return res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    console.error('[Assistance Request Controller] getRequestById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assistance request.'
    });
  }
}

/**
 * GET /api/assistance-requests/:id/matches
 * Access: Admin only (V2.1 Resource Matching)
 */
async function getMatches(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID.'
      });
    }

    const matches = await assistanceRequestModel.getSuggestedMatches(id);

    return res.status(200).json({
      success: true,
      requestId: id,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('[Assistance Request Controller] getMatches error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute inventory matches.'
    });
  }
}

/**
 * PUT /api/assistance-requests/:id/priority
 * Access: Admin only (V2.1 Volunteer Task Tracking)
 */
async function updatePriority(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { priority, deadline } = req.body;

    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be "Low", "Medium", or "High".'
      });
    }

    const updated = await assistanceRequestModel.updatePriority(id, { priority, deadline });

    return res.status(200).json({
      success: true,
      message: 'Priority and deadline updated successfully.',
      request: updated
    });
  } catch (error) {
    console.error('[Assistance Request Controller] updatePriority error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update priority and deadline.'
    });
  }
}

/**
 * PUT /api/assistance-requests/:id/review
 * Access: Admin only
 */
async function reviewRequest(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const adminId = req.user.id;
    const { status, adminNotes } = req.body;

    if (!['Approved', 'Rejected', 'Under Review'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Review status must be "Approved", "Rejected", or "Under Review".'
      });
    }

    const updated = await assistanceRequestModel.review(id, { status, adminNotes }, adminId);

    // Trigger notification to beneficiary if linked user account exists
    if (updated && updated.beneficiary_email) {
      try {
        const [users] = await query("SELECT id FROM users WHERE LOWER(email) = ?", [updated.beneficiary_email.toLowerCase()]);
        if (users && users.length > 0) {
          await notificationModel.create({
            recipient_id: users[0].id,
            type: 'AssistanceRequestUpdate',
            message: `Your assistance request #REQ-00${id} was marked as "${status}" by an administrator.`,
            reference_type: 'AssistanceRequest',
            reference_id: id
          });
        }
      } catch (e) {
        // Silent fail for unlinked beneficiaries
      }
    }

    return res.status(200).json({
      success: true,
      message: `Request status updated to "${status}".`,
      request: updated
    });
  } catch (error) {
    console.error('[Assistance Request Controller] reviewRequest error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to review assistance request.'
    });
  }
}

/**
 * PUT /api/assistance-requests/:id/allocate
 * Access: Admin only
 */
async function allocateResources(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const adminId = req.user.id;
    let { allocations, volunteerId, assigned_volunteer_id, inventory_item_id, quantity, adminNotes, notes, priority, deadline } = req.body;

    const targetVolunteerId = volunteerId || assigned_volunteer_id;

    if (!allocations || !Array.isArray(allocations)) {
      if (inventory_item_id && quantity) {
        allocations = [{ inventory_item_id: parseInt(inventory_item_id, 10), quantity: parseFloat(quantity) }];
      } else {
        allocations = [];
      }
    }

    const updated = await assistanceRequestModel.allocateAndAssign(
      id,
      {
        allocations,
        volunteerId: targetVolunteerId,
        adminNotes: adminNotes || notes,
        priority,
        deadline
      },
      adminId
    );

    // Trigger In-App Notification to Volunteer (V2.1)
    if (targetVolunteerId) {
      try {
        await notificationModel.create({
          recipient_id: parseInt(targetVolunteerId, 10),
          type: 'TaskAssigned',
          message: `You have been assigned to a relief delivery task: Request #REQ-00${id} (${updated.category}).`,
          reference_type: 'AssistanceRequest',
          reference_id: id
        });
      } catch (notifErr) {
        console.warn('[Assistance Request Controller] Failed to notify volunteer:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resources allocated and volunteer assignment updated successfully.',
      request: updated
    });
  } catch (error) {
    console.error('[Assistance Request Controller] allocateResources error:', error);
    const isValidationError = error.message.includes('Insufficient') || error.message.includes('not found') || error.message.includes('No items');
    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to allocate resources.'
    });
  }
}

module.exports = {
  submitRequest,
  getAllRequests,
  getRequestById,
  getMatches,
  updatePriority,
  reviewRequest,
  allocateResources
};

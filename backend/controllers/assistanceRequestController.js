const assistanceRequestModel = require('../models/assistanceRequestModel');
const beneficiaryModel = require('../models/beneficiaryModel');
const { validateAssistanceRequest, validateBeneficiary } = require('../utils/validationUtils');

/**
 * POST /api/assistance-requests
 * Access: Public / Beneficiary
 */
async function submitRequest(req, res) {
  try {
    const {
      beneficiary_id,
      // If beneficiary_id not supplied, allow submitting beneficiary info inline
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
 */
async function getAllRequests(req, res) {
  try {
    const { status, urgency, category } = req.query;
    const requests = await assistanceRequestModel.getAll({ status, urgency, category });

    return res.status(200).json({
      success: true,
      requests
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
    let { allocations, volunteerId, assigned_volunteer_id, inventory_item_id, quantity, adminNotes, notes } = req.body;

    // Normalize volunteer ID
    const targetVolunteerId = volunteerId || assigned_volunteer_id;

    // Normalize allocations array
    if (!allocations || !Array.isArray(allocations)) {
      if (inventory_item_id && quantity) {
        allocations = [{ inventory_item_id: parseInt(inventory_item_id, 10), quantity: parseFloat(quantity) }];
      } else {
        allocations = [];
      }
    }

    const updated = await assistanceRequestModel.allocateAndAssign(
      id,
      { allocations, volunteerId: targetVolunteerId, adminNotes: adminNotes || notes },
      adminId
    );

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
  reviewRequest,
  allocateResources
};

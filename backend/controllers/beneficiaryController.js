const beneficiaryModel = require('../models/beneficiaryModel');
const { validateBeneficiary } = require('../utils/validationUtils');

/**
 * POST /api/beneficiaries
 * Access: Public / Admin
 */
async function createBeneficiary(req, res) {
  try {
    const { isValid, errors } = validateBeneficiary(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation error.',
        errors
      });
    }

    const { name, phone, email, address, category, notes } = req.body;
    const beneficiary = await beneficiaryModel.findOrCreate({
      name,
      phone,
      email,
      address,
      category,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'Beneficiary registered successfully.',
      beneficiary
    });
  } catch (error) {
    console.error('[Beneficiary Controller] createBeneficiary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create beneficiary record.'
    });
  }
}

/**
 * GET /api/beneficiaries
 * Access: Admin only
 */
async function getAllBeneficiaries(req, res) {
  try {
    const beneficiaries = await beneficiaryModel.getAll();
    return res.status(200).json({
      success: true,
      beneficiaries
    });
  } catch (error) {
    console.error('[Beneficiary Controller] getAllBeneficiaries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch beneficiaries.'
    });
  }
}

/**
 * GET /api/beneficiaries/:id
 * Access: Admin only
 */
async function getBeneficiaryById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid beneficiary ID.'
      });
    }

    const beneficiary = await beneficiaryModel.findByIdWithHistory(id);
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found.'
      });
    }

    return res.status(200).json({
      success: true,
      beneficiary
    });
  } catch (error) {
    console.error('[Beneficiary Controller] getBeneficiaryById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch beneficiary details.'
    });
  }
}

/**
 * PUT /api/beneficiaries/:id
 * Access: Admin only
 */
async function updateBeneficiary(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid beneficiary ID.'
      });
    }

    const { isValid, errors } = validateBeneficiary(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation error.',
        errors
      });
    }

    const { name, phone, email, address, category, notes } = req.body;
    const updated = await beneficiaryModel.update(id, {
      name,
      phone,
      email,
      address,
      category,
      notes
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found.'
      });
    }

    const fresh = await beneficiaryModel.findByIdWithHistory(id);

    return res.status(200).json({
      success: true,
      message: 'Beneficiary updated successfully.',
      beneficiary: fresh
    });
  } catch (error) {
    console.error('[Beneficiary Controller] updateBeneficiary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update beneficiary.'
    });
  }
}

module.exports = {
  createBeneficiary,
  getAllBeneficiaries,
  getBeneficiaryById,
  updateBeneficiary
};

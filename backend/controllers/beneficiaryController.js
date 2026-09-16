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
    const { search, category, page, pageSize } = req.query;
    const beneficiaries = await beneficiaryModel.getAll({ search, category });
    const total = beneficiaries.length;

    if (page || pageSize) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
      const offset = (pageNum - 1) * limit;
      const paginated = beneficiaries.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        count: paginated.length,
        beneficiaries: paginated,
        data: paginated
      });
    }

    return res.status(200).json({
      success: true,
      count: beneficiaries.length,
      total,
      beneficiaries,
      data: beneficiaries
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

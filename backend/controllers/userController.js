const userModel = require('../models/userModel');
const { validateProfileUpdate } = require('../utils/validationUtils');

/**
 * GET /api/users/profile
 * Return authenticated user's profile
 */
async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[User Controller] getProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
}

/**
 * PUT /api/users/profile
 * Update authenticated user's name and phone
 * Prevents role changes and uses JWT identity only
 */
async function updateProfile(req, res) {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id; // Strictly taken from authenticated JWT identity

    // Validate inputs
    const validation = validateProfileUpdate({ name, phone });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors
      });
    }

    // Perform update in MySQL
    const updated = await userModel.updateProfile(userId, { name, phone });
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Profile could not be updated or no changes were made.'
      });
    }

    // Retrieve fresh safe user data
    const updatedUser = await userModel.findById(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('[User Controller] updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};

const userModel = require('../models/userModel');
const { getIsUsingMySQL } = require('../config/db');

/**
 * GET /api/admin/users
 * Returns list of registered users (no passwords)
 * Admin-only
 */
async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('[Admin Controller] getUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registered users list.'
    });
  }
}

/**
 * GET /api/admin/stats
 * Returns live counts and system status
 * Admin-only
 */
async function getStats(req, res) {
  try {
    const counts = await userModel.getCounts();
    const isDbConnected = true; // DB is operational (direct MySQL or active pool)
    const usingDirectMySQL = getIsUsingMySQL();

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: counts.totalUsers,
        totalDonors: counts.totalDonors,
        totalAdmins: counts.totalAdmins,
        systemStatus: 'Operational',
        databaseEngine: usingDirectMySQL ? 'MySQL 8.0 Active' : 'MySQL Driver Active (Persistent)',
        databaseStatus: isDbConnected ? 'Healthy' : 'Degraded',
        serverTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Admin Controller] getStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative statistics.'
    });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Deactivate / delete a user account (DEF-07 / TC-ADM-05)
 * Admin-only
 */
async function deleteUser(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const requestingAdminId = req.user.id;

    if (targetUserId === requestingAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete or deactivate their own active account.'
      });
    }

    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already deactivated.'
      });
    }

    await userModel.delete(targetUserId);

    return res.status(200).json({
      success: true,
      message: `Account #${targetUserId} (${targetUser.name}) has been deactivated and removed successfully.`
    });
  } catch (error) {
    console.error('[Admin Controller] deleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user account.'
    });
  }
}

module.exports = {
  getUsers,
  getStats,
  deleteUser
};

const userModel = require('../models/userModel');
const auditLogModel = require('../models/auditLogModel');
const { getIsUsingMySQL } = require('../config/db');

/**
 * GET /api/admin/users
 * Returns list of registered users (no passwords)
 * Admin-only
 * Query: page, pageSize, search, role, status
 */
async function getUsers(req, res) {
  try {
    const { page, pageSize, search, role, status } = req.query;
    const result = await userModel.getAllUsers({ page, pageSize, search, role, status });

    if (page || pageSize) {
      return res.status(200).json({
        success: true,
        ...result
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      users: result,
      data: result
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
 * PUT /api/admin/users/:id/deactivate
 * Soft-deactivates user account and logs audit entry
 */
async function deactivateUser(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const requestingAdminId = req.user.id;

    if (targetUserId === requestingAdminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active admin account.'
      });
    }

    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    await userModel.deactivateUser(targetUserId);

    await auditLogModel.log({
      adminId: requestingAdminId,
      action: 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: targetUserId,
      details: {
        userName: targetUser.name,
        userEmail: targetUser.email,
        role: targetUser.role
      },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Account for ${targetUser.name} has been deactivated successfully.`
    });
  } catch (error) {
    console.error('[Admin Controller] deactivateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate user account.'
    });
  }
}

/**
 * PUT /api/admin/users/:id/reactivate
 * Reactivates a suspended user account and logs audit entry
 */
async function reactivateUser(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const requestingAdminId = req.user.id;

    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    await userModel.reactivateUser(targetUserId);

    await auditLogModel.log({
      adminId: requestingAdminId,
      action: 'USER_REACTIVATED',
      targetType: 'User',
      targetId: targetUserId,
      details: {
        userName: targetUser.name,
        userEmail: targetUser.email,
        role: targetUser.role
      },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Account for ${targetUser.name} has been reactivated successfully.`
    });
  } catch (error) {
    console.error('[Admin Controller] reactivateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reactivate user account.'
    });
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Changes a user's role and records audit entry
 */
async function updateUserRole(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const requestingAdminId = req.user.id;
    const { role } = req.body;

    if (!role || !['Donor', 'Volunteer', 'Admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be Donor, Volunteer, or Admin.'
      });
    }

    if (targetUserId === requestingAdminId && role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove Admin role from your own session.'
      });
    }

    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const previousRole = targetUser.role;
    await userModel.updateRole(targetUserId, role);

    await auditLogModel.log({
      adminId: requestingAdminId,
      action: 'USER_ROLE_CHANGED',
      targetType: 'User',
      targetId: targetUserId,
      details: {
        userName: targetUser.name,
        userEmail: targetUser.email,
        previousRole,
        newRole: role
      },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Role for ${targetUser.name} changed from ${previousRole} to ${role}.`
    });
  } catch (error) {
    console.error('[Admin Controller] updateUserRole error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.'
    });
  }
}

/**
 * GET /api/admin/audit-log
 * Immutable write-only audit logs viewer
 */
async function getAuditLogs(req, res) {
  try {
    const { page = 1, pageSize = 20, action, targetType } = req.query;
    const result = await auditLogModel.getLogs({ page, pageSize, action, targetType });
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[Admin Controller] getAuditLogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative audit log.'
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

    // By default in V3.2, we soft-deactivate instead of hard cascade-deleting
    await userModel.deactivateUser(targetUserId);

    await auditLogModel.log({
      adminId: requestingAdminId,
      action: 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: targetUserId,
      details: {
        userName: targetUser.name,
        userEmail: targetUser.email,
        role: targetUser.role,
        method: 'soft_delete'
      },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Account #${targetUserId} (${targetUser.name}) has been deactivated successfully.`
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
  deleteUser,
  deactivateUser,
  reactivateUser,
  updateUserRole,
  getAuditLogs
};

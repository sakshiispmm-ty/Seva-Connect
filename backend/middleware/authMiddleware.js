const { verifyToken: decodeJwt } = require('../utils/jwtUtils');
const userModel = require('../models/userModel');

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing. Please sign in to continue.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token format.'
      });
    }

    let decoded;
    try {
      decoded = decodeJwt(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session has expired. Please sign in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid or tampered authentication token.'
      });
    }

    // Always fetch fresh user from database to verify identity and active status
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or removed.'
      });
    }

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach authenticated identity
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying authentication.'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. This action requires one of roles: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = decodeJwt(token);
          const user = await userModel.findById(decoded.id);
          if (user) {
            req.user = user;
          }
        } catch (e) {
          // Silently continue as guest if token expired or invalid
        }
      }
    }
    next();
  } catch (err) {
    next();
  }
}

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth
};


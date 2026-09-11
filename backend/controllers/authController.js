const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');
const { validateRegistration, validateLogin, EMAIL_REGEX } = require('../utils/validationUtils');
const { recordFailedLogin, resetLoginAttempts } = require('../middleware/rateLimitMiddleware');

// In-memory store for password reset tokens / OTPs with expiration (DEF-04)
const resetTokenStore = new Map();

async function register(req, res) {
  try {
    const { name, email, phone, password, confirmPassword, role, adminSecretKey } = req.body;

    // 1-7. Validation
    const validation = validateRegistration({ name, email, phone, password, confirmPassword, role, adminSecretKey });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 8. Check whether email already exists
    const existingUser = await userModel.findByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
    }

    // 9. Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 10. Insert user into MySQL
    const newUserId = await userModel.create({
      name: String(name).trim(),
      email: trimmedEmail,
      phone: String(phone).trim(),
      password: hashedPassword,
      role: role || 'Donor'
    });

    // 11. Return safe user information (never password/hash)
    const safeUser = await userModel.findById(newUserId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      user: safeUser
    });
  } catch (error) {
    console.error('[Auth Controller] Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'A server error occurred during registration. Please try again.'
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validate email/password presence and format
    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0]
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // 2. Find user in MySQL
    const user = await userModel.findByEmail(trimmedEmail);
    if (!user) {
      recordFailedLogin(req);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3-4. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedLogin(req);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Reset failed login attempts on successful login
    resetLoginAttempts(req);

    // 5-6. Generate JWT after successful authentication
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // 7-8. Return safe user information (never return password/hash)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'A server error occurred during login. Please try again.'
    });
  }
}

async function logout(req, res) {
  // Stateless JWT logout acknowledgment
  return res.status(200).json({
    success: true,
    message: 'Logout successful.'
  });
}

async function getMe(req, res) {
  try {
    // req.user is already safely populated by verifyToken middleware (no passwords)
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('[Auth Controller] getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve authenticated session.'
    });
  }
}

/**
 * POST /api/auth/forgot-password (DEF-04 / TC-AUTH-06)
 * Generates email recovery reset token / OTP
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid registered email address is required.'
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await userModel.findByEmail(trimmedEmail);
    if (!user) {
      // Return 404 or safe message for non-existent email
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.'
      });
    }

    // Generate 6-digit OTP code and a token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    resetTokenStore.set(trimmedEmail, {
      otp,
      resetToken,
      expiresAt
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset code has been generated. Use the verification OTP below to reset your password.',
      otp,
      resetToken
    });
  } catch (error) {
    console.error('[Auth Controller] forgotPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate password recovery.'
    });
  }
}

/**
 * POST /api/auth/reset-password (DEF-04 / TC-AUTH-06)
 * Resets user password using recovery OTP / token
 */
async function resetPassword(req, res) {
  try {
    const { email, token, otp, newPassword, confirmPassword } = req.body;

    if (!email || !EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const record = resetTokenStore.get(trimmedEmail);

    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Password reset code is invalid or has expired. Please request a new code.'
      });
    }

    const providedToken = String(token || otp || '').trim();
    if (providedToken !== record.otp && providedToken !== record.resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification OTP or token.'
      });
    }

    // Validate new password complexity (DEF-03)
    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'New password is required.'
      });
    } else if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 1 uppercase and 1 number.'
      });
    } else if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await userModel.updatePasswordByEmail(trimmedEmail, hashedPassword);
    resetTokenStore.delete(trimmedEmail);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now sign in with your new credentials.'
    });
  } catch (error) {
    console.error('[Auth Controller] resetPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.'
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};

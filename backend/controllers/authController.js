const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');
const { validateRegistration, validateLogin, EMAIL_REGEX } = require('../utils/validationUtils');
const { recordFailedLogin, resetLoginAttempts } = require('../middleware/rateLimitMiddleware');
const { sendPasswordResetOtp, getVirtualEmails } = require('../utils/emailUtils');

// In-memory + persistent store for password reset tokens / OTPs with expiration (DEF-04)
const fs = require('fs');
const path = require('path');
const resetTokenStore = new Map();
const resetTokensFilePath = path.join(__dirname, '..', 'data', 'reset_tokens.json');

function getStoredTokens() {
  try {
    if (fs.existsSync(resetTokensFilePath)) {
      const content = fs.readFileSync(resetTokensFilePath, 'utf8');
      return JSON.parse(content) || {};
    }
  } catch (e) {
    console.error('[Auth Controller] Failed reading reset_tokens.json:', e);
  }
  return {};
}

function saveTokenToDisk(email, record) {
  try {
    const tokens = getStoredTokens();
    tokens[email.toLowerCase()] = record;
    fs.writeFileSync(resetTokensFilePath, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (e) {
    console.error('[Auth Controller] Failed writing reset_tokens.json:', e);
  }
}

function removeTokenFromDisk(email) {
  try {
    const tokens = getStoredTokens();
    delete tokens[email.toLowerCase()];
    fs.writeFileSync(resetTokensFilePath, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (e) {
    console.error('[Auth Controller] Failed removing token from reset_tokens.json:', e);
  }
}

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
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 mins

    const record = { otp, resetToken, expiresAt };
    resetTokenStore.set(trimmedEmail, record);
    saveTokenToDisk(trimmedEmail, record);

    // Send real email to the user
    const emailResult = await sendPasswordResetOtp(trimmedEmail, otp, user.name);
    console.log(`[Auth Controller] Reset OTP generated for ${trimmedEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${trimmedEmail}. Please check your inbox and spam folder.`,
      emailSent: emailResult.sent,
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
    const diskTokens = getStoredTokens();
    const record = diskTokens[trimmedEmail] || resetTokenStore.get(trimmedEmail);

    if (!record || Date.now() > record.expiresAt) {
      console.warn(`[Auth Controller] Reset token missing or expired for ${trimmedEmail}`);
      return res.status(400).json({
        success: false,
        message: 'Password reset code is invalid or has expired. Please request a new code.'
      });
    }

    const providedToken = String(token || otp || '').trim();
    if (providedToken !== record.otp && providedToken !== record.resetToken) {
      console.warn(`[Auth Controller] OTP mismatch for ${trimmedEmail}: received "${providedToken}", expected "${record.otp}"`);
      return res.status(400).json({
        success: false,
        message: 'Invalid verification OTP or token. Please check your email inbox.'
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
        message: 'Password must contain at least 1 uppercase letter and 1 number.'
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

    const updateSuccess = await userModel.updatePasswordByEmail(trimmedEmail, hashedPassword);
    if (!updateSuccess) {
      console.error(`[Auth Controller] Failed updating password in database for ${trimmedEmail}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password in user registry.'
      });
    }

    resetTokenStore.delete(trimmedEmail);
    removeTokenFromDisk(trimmedEmail);
    console.log(`[Auth Controller] Password successfully reset for user: ${trimmedEmail}`);

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

/**
 * GET /api/auth/virtual-mailbox
 * Public/Dev endpoint for reading sent emails in real-time
 */
function getVirtualMailbox(req, res) {
  try {
    const { email } = req.query;
    const emails = getVirtualEmails(email);
    return res.status(200).json({
      success: true,
      emails,
      latest: emails[0] || null
    });
  } catch (error) {
    console.error('[Auth Controller] getVirtualMailbox error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve virtual mailbox.'
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  getVirtualMailbox
};

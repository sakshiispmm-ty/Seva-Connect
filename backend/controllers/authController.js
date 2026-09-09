const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtils');
const { validateRegistration, validateLogin } = require('../utils/validationUtils');

async function register(req, res) {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    // 1-7. Validation
    const validation = validateRegistration({ name, email, phone, password, confirmPassword, role });
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
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3-4. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

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

module.exports = {
  register,
  login,
  logout,
  getMe
};

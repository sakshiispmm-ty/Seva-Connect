// Regular expressions for strict validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s\-()]{7,20}$/;

function validateRegistration(data) {
  const errors = [];
  const { name, email, phone, password, confirmPassword, role } = data || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full Name is required and must be at least 2 characters.');
  } else if (name.trim().length > 100) {
    errors.push('Full Name cannot exceed 100 characters.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    errors.push('A valid phone number (7 to 20 digits/symbols) is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }

  if (!role || !['Donor', 'Admin'].includes(role)) {
    errors.push('Role must be either "Donor" or "Admin".');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateLogin(data) {
  const errors = [];
  const { email, password } = data || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateProfileUpdate(data) {
  const errors = [];
  const { name, phone } = data || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full Name must be at least 2 characters.');
  } else if (name.trim().length > 100) {
    errors.push('Full Name cannot exceed 100 characters.');
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    errors.push('A valid phone number (7 to 20 digits/symbols) is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  EMAIL_REGEX,
  PHONE_REGEX
};

const jwt = require('jsonwebtoken');

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('[Security Warning] JWT_SECRET is not set in environment variables! Using fallback key.');
    return 'sevaconnect_default_jwt_secret_change_in_production';
  }
  return secret;
}

function generateToken(payload) {
  const secret = getSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  const secret = getSecret();
  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken
};

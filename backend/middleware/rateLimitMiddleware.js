/**
 * Brute-force rate limiting middleware for /api/auth/login (TC-AUTH-05 / DEF-02)
 * Max 5 failed attempts per 15 minutes per IP address.
 */
const loginAttempts = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection?.remoteAddress || '127.0.0.1';
}

function loginRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    // Filter attempts within sliding window
    const recentAttempts = record.attempts.filter(timestamp => now - timestamp < WINDOW_MS);
    record.attempts = recentAttempts;

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0];
      const retryAfterMinutes = Math.ceil((WINDOW_MS - (now - oldestAttempt)) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please try again after ${retryAfterMinutes} minute(s).`
      });
    }
  }

  next();
}

function recordFailedLogin(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: [] };
  record.attempts.push(now);
  loginAttempts.set(ip, record);
}

function resetLoginAttempts(req) {
  const ip = getClientIp(req);
  loginAttempts.delete(ip);
}

function createEndpointRateLimiter({
  windowMs = 60 * 1000,
  maxRequests = 30,
  message = 'Too many requests. Please slow down and try again.'
} = {}) {
  const requestCounts = new Map();

  return (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();
    let record = requestCounts.get(ip);

    if (!record) {
      record = { timestamps: [] };
      requestCounts.set(ip, record);
    }

    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    record.timestamps.push(now);
    next();
  };
}

module.exports = {
  loginRateLimiter,
  recordFailedLogin,
  resetLoginAttempts,
  createEndpointRateLimiter
};

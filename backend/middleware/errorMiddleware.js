function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error('[Server Error]', err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    // Never expose stack traces in production
    ...(isProd ? {} : { debugMessage: err.message })
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};

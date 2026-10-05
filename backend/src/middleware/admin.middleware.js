const ApiError = require('../utils/ApiError');

/**
 * Middleware: Check if the authenticated user is an admin.
 * Must be used after verifyToken.
 */
const isAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }

  next();
};

module.exports = { isAdmin };

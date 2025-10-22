const jwt = require('jsonwebtoken');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    if (!req.user.isActive) {
      return next(new AppError('User account is deactivated', 403));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Check if user owns the resource
 */
exports.checkOwnership = (model) => {
  return asyncHandler(async (req, res, next) => {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check if user is owner or admin
    const isOwner = resource.user?.toString() === req.user.id ||
                    resource.seller?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(
        new AppError('Not authorized to access this resource', 403)
      );
    }

    req.resource = resource;
    next();
  });
};

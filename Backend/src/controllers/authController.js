const User = require('../models/User');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'customer',
  });

  // Send welcome email (don't wait for it)
  sendWelcomeEmail(user).catch((err) => {
    logger.error(`Failed to send welcome email: ${err.message}`);
  });

  // Generate token
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password: password ? '[PROVIDED]' : '[MISSING]' });

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  console.log('User found:', user ? `${user.email} (${user.role})` : 'NO USER FOUND');

  if (!user) {
    console.log('LOGIN FAILED: User not found');
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    console.log('LOGIN FAILED: User inactive');
    return next(new AppError('Your account has been deactivated', 403));
  }

  // Verify password
  console.log('Testing password...');
  const isPasswordMatch = await user.comparePassword(password);
  console.log('Password match result:', isPasswordMatch);
  
  if (!isPasswordMatch) {
    console.log('LOGIN FAILED: Password mismatch');
    return next(new AppError('Invalid credentials', 401));
  }

  console.log('LOGIN SUCCESS: Generating token...');

  // Generate token
  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find user by reset token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // In a stateless JWT system, logout is handled client-side
  // This endpoint is for consistency and future token blacklisting
  
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

const Report = require('../models/Report');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../utils/errorHandler');

/**
 * @desc    Create new report
 * @route   POST /api/v1/reports
 * @access  Private (User)
 */
exports.createReport = asyncHandler(async (req, res, next) => {
  const { productId, reason, comment, productName, productPrice } = req.body;

  // Validate required fields
  if (!productId || !reason || !productName || !productPrice) {
    return next(new AppError('Product ID, reason, product name, and price are required', 400));
  }

  // Check if user already reported this product
  const existingReport = await Report.findOne({
    productId,
    reportedBy: req.user.id,
    status: { $in: ['pending', 'reviewed'] }
  });

  if (existingReport) {
    return next(new AppError('You have already reported this product', 400));
  }

  // Get product details
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Create report
  const report = await Report.create({
    productId,
    productName,
    productPrice,
    reason,
    comment,
    reportedBy: req.user.id,
    reporterName: req.user.firstName + ' ' + req.user.lastName,
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: { report },
  });
});

/**
 * @desc    Get all reports
 * @route   GET /api/v1/reports
 * @access  Private (Admin)
 */
exports.getReports = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Build filter
  const filter = {};
  if (status) {
    filter.status = status;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('productId', 'name price category condition images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Report.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      reports,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: reports.length,
      },
    },
  });
});

/**
 * @desc    Get single report
 * @route   GET /api/v1/reports/:id
 * @access  Private (Admin)
 */
exports.getReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id)
    .populate('reportedBy', 'firstName lastName email')
    .populate('reviewedBy', 'firstName lastName email')
    .populate('productId', 'name price category condition images seller');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { report },
  });
});

/**
 * @desc    Update report status
 * @route   PUT /api/v1/reports/:id/status
 * @access  Private (Admin)
 */
exports.updateReportStatus = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  const report = await Report.findById(req.params.id);
  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  // Update report
  report.status = status;
  report.adminNotes = adminNotes;
  report.reviewedBy = req.user.id;
  report.reviewedAt = Date.now();

  await report.save();

  // Populate for response
  await report.populate('reviewedBy', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Report status updated successfully',
    data: { report },
  });
});

/**
 * @desc    Get report statistics
 * @route   GET /api/v1/reports/stats
 * @access  Private (Admin)
 */
exports.getReportStats = asyncHandler(async (req, res, next) => {
  const stats = await Report.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Also get stats by reason
  const reasonStats = await Report.aggregate([
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get total count
  const totalCount = await Report.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      statusBreakdown: stats,
      reasonBreakdown: reasonStats,
      total: totalCount,
    },
  });
});

/**
 * @desc    Delete report
 * @route   DELETE /api/v1/reports/:id
 * @access  Private (Admin)
 */
exports.deleteReport = asyncHandler(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  await Report.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Report deleted successfully',
  });
});

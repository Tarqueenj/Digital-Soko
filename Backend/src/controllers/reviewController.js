const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { uploadMultipleImages } = require('../services/uploadService');
const { paginate, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get reviews for a product
 * @route   GET /api/v1/products/:productId/reviews
 * @access  Public
 */
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = { product: req.params.productId };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName avatar'),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: buildPaginationResponse(total, page, limit),
    },
  });
});

/**
 * @desc    Create product review
 * @route   POST /api/v1/products/:productId/reviews
 * @access  Private
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user.id,
    'items.product': productId,
    orderStatus: 'delivered',
  });

  // Handle image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadMultipleImages(req.files, 'reviews');
  }

  // Create review
  const review = await Review.create({
    product: productId,
    user: req.user.id,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: !!hasPurchased,
  });

  // Populate user data
  await review.populate('user', 'firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review },
  });
});

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check ownership
  if (review.user.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this review', 403));
  }

  const { rating, title, comment } = req.body;

  review = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, title, comment },
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName avatar');

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review },
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check ownership or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

/**
 * @desc    Mark review as helpful
 * @route   PUT /api/v1/reviews/:id/helpful
 * @access  Private
 */
exports.markReviewHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check if user already marked as helpful
  const alreadyMarked = review.helpfulBy.includes(req.user.id);

  if (alreadyMarked) {
    // Remove from helpful
    review.helpfulBy = review.helpfulBy.filter(
      (userId) => userId.toString() !== req.user.id
    );
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    // Add to helpful
    review.helpfulBy.push(req.user.id);
    review.helpfulCount += 1;
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: alreadyMarked ? 'Removed from helpful' : 'Marked as helpful',
    data: { review },
  });
});

/**
 * @desc    Get user's reviews
 * @route   GET /api/v1/reviews/me
 * @access  Private
 */
exports.getMyReviews = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('product', 'name images price'),
    Review.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination: buildPaginationResponse(total, page, limit),
    },
  });
});

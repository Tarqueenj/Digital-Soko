const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../utils/errorHandler');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
exports.getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
    path: 'products.product',
    select: 'name price images stock isActive ratings',
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }

  res.status(200).json({
    success: true,
    data: { wishlist },
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist/:productId
 * @access  Private
 */
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Get or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, products: [] });
  }

  // Check if already in wishlist
  if (wishlist.hasProduct(productId)) {
    return next(new AppError('Product already in wishlist', 400));
  }

  // Add to wishlist
  wishlist.addProduct(productId);
  await wishlist.save();

  // Populate and return
  wishlist = await wishlist.populate({
    path: 'products.product',
    select: 'name price images stock isActive ratings',
  });

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    data: { wishlist },
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private
 */
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  // Check if product exists in wishlist
  if (!wishlist.hasProduct(productId)) {
    return next(new AppError('Product not in wishlist', 404));
  }

  // Remove from wishlist
  wishlist.removeProduct(productId);
  await wishlist.save();

  // Populate and return
  wishlist = await wishlist.populate({
    path: 'products.product',
    select: 'name price images stock isActive ratings',
  });

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: { wishlist },
  });
});

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/v1/wishlist
 * @access  Private
 */
exports.clearWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    return next(new AppError('Wishlist not found', 404));
  }

  wishlist.products = [];
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared',
    data: { wishlist },
  });
});

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../utils/errorHandler');

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.product',
    select: 'name price images stock isActive',
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: { cart },
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @access  Private
 */
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!product.isActive) {
    return next(new AppError('Product is not available', 400));
  }

  if (product.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Add item to cart
  cart.addItem(productId, quantity, product.price);
  await cart.save();

  // Populate and return
  cart = await cart.populate({
    path: 'items.product',
    select: 'name price images stock isActive',
  });

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: { cart },
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/items/:productId
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  // Validate product and stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Insufficient stock', 400));
  }

  // Update cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.updateItemQuantity(productId, quantity);
  await cart.save();

  // Populate and return
  cart = await cart.populate({
    path: 'items.product',
    select: 'name price images stock isActive',
  });

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: { cart },
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:productId
 * @access  Private
 */
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.removeItem(productId);
  await cart.save();

  // Populate and return
  cart = await cart.populate({
    path: 'items.product',
    select: 'name price images stock isActive',
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: { cart },
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.clearCart();
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: { cart },
  });
});

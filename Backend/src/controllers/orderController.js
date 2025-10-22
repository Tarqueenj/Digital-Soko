const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { createPaymentIntent } = require('../services/paymentService');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/emailService');
const { paginate, buildPaginationResponse, calculateTax, calculateShipping } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('No order items provided', 400));
  }

  // Validate and calculate order totals
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Product ${item.product} not found`, 404));
    }

    if (!product.isActive) {
      return next(new AppError(`Product ${product.name} is not available`, 400));
    }

    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }

    itemsPrice += product.price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.images[0]?.url || '',
    });
  }

  // Calculate totals
  const taxPrice = calculateTax(itemsPrice);
  const shippingPrice = calculateShipping(0, shippingAddress.country);
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Create payment intent for Stripe
  let paymentResult = {};
  if (paymentMethod === 'stripe') {
    const paymentIntent = await createPaymentIntent(totalPrice, 'usd', {
      userId: req.user.id,
    });
    paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentResult,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: paymentMethod === 'cod' ? false : false, // Will be updated via webhook
  });

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear user's cart
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [], totalAmount: 0 }
  );

  // Send confirmation email
  const user = req.user;
  sendOrderConfirmationEmail(user, order).catch((err) => {
    logger.error(`Failed to send order confirmation email: ${err.message}`);
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { 
      order,
      ...(paymentMethod === 'stripe' && { clientSecret: paymentResult.id }),
    },
  });
});

/**
 * @desc    Get all orders (admin) or user's orders
 * @route   GET /api/v1/orders
 * @access  Private
 */
exports.getOrders = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  let filter = {};
  
  // Non-admin users can only see their own orders
  if (req.user.role !== 'admin') {
    filter.user = req.user.id;
  }

  // Filter by status
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email'),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: buildPaginationResponse(total, page, limit),
    },
  });
});

/**
 * @desc    Get single order
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name images');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private (Admin)
 */
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id).populate('user');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.orderStatus = orderStatus;
  
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  if (orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Send status update email
  sendOrderStatusEmail(order.user, order).catch((err) => {
    logger.error(`Failed to send order status email: ${err.message}`);
  });

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: { order },
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check authorization
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to cancel this order', 403));
  }

  // Can only cancel pending or processing orders
  if (!['pending', 'processing'].includes(order.orderStatus)) {
    return next(new AppError('Cannot cancel order at this stage', 400));
  }

  order.orderStatus = 'cancelled';
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/v1/orders/stats
 * @access  Private (Admin)
 */
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
  });
});

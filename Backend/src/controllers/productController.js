const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { uploadMultipleImages, deleteMultipleImages } = require('../services/uploadService');
const { paginate, buildPaginationResponse, buildSort, buildFilter } = require('../utils/helpers');

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Build filter
  const filter = buildFilter(req.query);
  
  // Add active filter for non-admin users
  if (!req.user || req.user.role !== 'admin') {
    filter.isActive = true;
  }

  // Text search
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Build sort
  const sort = buildSort(req.query.sort);

  // Pagination
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('seller', 'firstName lastName email'),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: buildPaginationResponse(total, page, limit),
    },
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'firstName lastName email')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'firstName lastName avatar' },
    });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});

/**
 * @desc    Create new product
 * @route   POST /api/v1/products
 * @access  Private (Seller, Admin)
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add seller to product data
  req.body.seller = req.user.id;

  // Handle image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadMultipleImages(req.files, 'products');
  }

  req.body.images = images;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private (Seller-Owner, Admin)
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to update this product', 403));
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = await uploadMultipleImages(req.files, 'products');
    req.body.images = [...product.images, ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Seller-Owner, Admin)
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to delete this product', 403));
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    const publicIds = product.images.map((img) => img.public_id);
    await deleteMultipleImages(publicIds);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

/**
 * @desc    Delete product image
 * @route   DELETE /api/v1/products/:id/images/:imageId
 * @access  Private (Seller-Owner, Admin)
 */
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to modify this product', 403));
  }

  const imageIndex = product.images.findIndex(
    (img) => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new AppError('Image not found', 404));
  }

  // Delete from Cloudinary
  await deleteMultipleImages([product.images[imageIndex].public_id]);

  // Remove from product
  product.images.splice(imageIndex, 1);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
    data: { product },
  });
});

/**
 * @desc    Get products by seller
 * @route   GET /api/v1/products/seller/:sellerId
 * @access  Public
 */
exports.getProductsBySeller = asyncHandler(async (req, res, next) => {
  const { skip, limit, page } = paginate(req.query.page, req.query.limit);

  const filter = { seller: req.params.sellerId, isActive: true };

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: buildPaginationResponse(total, page, limit),
    },
  });
});

/**
 * @desc    Get featured products
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(10)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { products },
  });
});

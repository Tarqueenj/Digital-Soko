const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductsBySeller,
  getFeaturedProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { createLimiter } = require('../middleware/rateLimiter');
const {
  createProductValidation,
  updateProductValidation,
  validateObjectId,
  validateSellerId,
  paginationValidation,
  validate,
} = require('../middleware/validation');

// Public routes
router.get('/', paginationValidation, validate, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/seller/:sellerId', validateSellerId, validate, getProductsBySeller);
router.get('/:id', validateObjectId, validate, getProduct);

// Protected routes (Seller, Admin)
router.use(protect);
router.post(
  '/',
  authorize('customer', 'seller', 'admin'),
  createLimiter,
  upload.array('images', 5),
  handleMulterError,
  createProductValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  authorize('customer', 'seller', 'admin'),
  validateObjectId,
  upload.array('images', 5),
  handleMulterError,
  updateProductValidation,
  validate,
  updateProduct
);

router.delete(
  '/:id',
  authorize('customer', 'seller', 'admin'),
  validateObjectId,
  validate,
  deleteProduct
);

router.delete(
  '/:id/images/:imageId',
  authorize('seller', 'admin'),
  validateObjectId,
  validate,
  deleteProductImage
);

module.exports = router;

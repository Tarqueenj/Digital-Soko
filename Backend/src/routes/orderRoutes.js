const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrderValidation,
  validateObjectId,
  paginationValidation,
  validate,
} = require('../middleware/validation');

// All order routes are protected
router.use(protect);

router.post('/', createOrderValidation, validate, createOrder);
router.get('/', paginationValidation, validate, getOrders);
router.get('/stats', authorize('admin'), getOrderStats);
router.get('/:id', validateObjectId, validate, getOrder);
router.put('/:id/cancel', validateObjectId, validate, cancelOrder);

// Admin only routes
router.put(
  '/:id/status',
  authorize('admin'),
  validateObjectId,
  validate,
  updateOrderStatus
);

module.exports = router;

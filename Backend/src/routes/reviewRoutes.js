const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getMyReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const {
  reviewValidation,
  validateObjectId,
  paginationValidation,
  validate,
} = require('../middleware/validation');

// Public routes
router.get('/', paginationValidation, validate, getProductReviews);

// Protected routes
router.use(protect);

router.get('/me', paginationValidation, validate, getMyReviews);

router.post(
  '/',
  upload.array('images', 3),
  handleMulterError,
  reviewValidation,
  validate,
  createReview
);

router.put('/:id', validateObjectId, reviewValidation, validate, updateReview);
router.delete('/:id', validateObjectId, validate, deleteReview);
router.put('/:id/helpful', validateObjectId, validate, markReviewHelpful);

module.exports = router;

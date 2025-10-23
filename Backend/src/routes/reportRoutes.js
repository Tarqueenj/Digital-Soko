const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  getReportStats,
  deleteReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');

// Report validation
const createReportValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('reason')
    .isIn(['overpriced', 'underpriced', 'misleading', 'other'])
    .withMessage('Invalid reason'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('productPrice')
    .isFloat({ min: 0 })
    .withMessage('Product price must be a positive number'),
];

const updateReportValidation = [
  body('status')
    .isIn(['pending', 'reviewed', 'resolved', 'dismissed'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters'),
];

// All routes require authentication
router.use(protect);

// Create report (User)
router.post('/', createReportValidation, validate, createReport);

// Admin routes
router.use(authorize('admin'));

// Get all reports (Admin)
router.get('/', getReports);

// Get single report (Admin)
router.get('/:id', getReport);

// Update report status (Admin)
router.put('/:id/status', updateReportValidation, validate, updateReportStatus);

// Get report statistics (Admin)
router.get('/stats/overview', getReportStats);

// Delete report (Admin)
router.delete('/:id', deleteReport);

module.exports = router;

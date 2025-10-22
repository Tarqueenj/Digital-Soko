/**
 * Pagination helper
 * @param {Object} query - Mongoose query object
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const paginate = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const maxLimit = parseInt(process.env.MAX_PAGE_SIZE || 100, 10);
  
  const validLimit = limitNum > maxLimit ? maxLimit : limitNum;
  const skip = (pageNum - 1) * validLimit;

  return {
    skip,
    limit: validLimit,
    page: pageNum,
  };
};

/**
 * Build pagination response
 * @param {number} total - Total number of documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const buildPaginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Build sort object from query string
 * @param {string} sortBy - Sort field and order (e.g., 'price:asc', '-createdAt')
 * @returns {Object} Sort object for mongoose
 */
const buildSort = (sortBy) => {
  if (!sortBy) return { createdAt: -1 };

  const sortFields = sortBy.split(',');
  const sortObject = {};

  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      sortObject[field.substring(1)] = -1;
    } else {
      const [key, order] = field.split(':');
      sortObject[key] = order === 'desc' ? -1 : 1;
    }
  });

  return sortObject;
};

/**
 * Build filter object from query parameters
 * @param {Object} query - Request query object
 * @param {Array} excludeFields - Fields to exclude from filter
 * @returns {Object} Filter object for mongoose
 */
const buildFilter = (query, excludeFields = ['page', 'limit', 'sort', 'fields']) => {
  const queryObj = { ...query };
  excludeFields.forEach((field) => delete queryObj[field]);

  // Advanced filtering (gte, gt, lte, lt)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

  return JSON.parse(queryStr);
};

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calculate tax amount
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Tax amount
 */
const calculateTax = (amount, taxRate = 10) => {
  return Math.round((amount * taxRate) / 100 * 100) / 100;
};

/**
 * Calculate shipping cost
 * @param {number} totalWeight - Total weight in kg
 * @param {string} country - Destination country
 * @returns {number} Shipping cost
 */
const calculateShipping = (totalWeight, country = 'US') => {
  const baseRate = 5;
  const perKgRate = 2;
  const internationalMultiplier = country === 'US' ? 1 : 2;
  
  return (baseRate + totalWeight * perKgRate) * internationalMultiplier;
};

/**
 * Sanitize user input
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeInput = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = obj[key].trim();
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

module.exports = {
  paginate,
  buildPaginationResponse,
  buildSort,
  buildFilter,
  generateRandomString,
  calculateTax,
  calculateShipping,
  sanitizeInput,
};

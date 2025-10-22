const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validation');

// All wishlist routes are protected
router.use(protect);

router.route('/').get(getWishlist).delete(clearWishlist);

router.post('/:productId', validateObjectId, validate, addToWishlist);
router.delete('/:productId', validateObjectId, validate, removeFromWishlist);

module.exports = router;

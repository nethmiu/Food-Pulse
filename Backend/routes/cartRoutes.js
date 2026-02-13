const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists

router.get('/', protect, cartController.getCart);
router.post('/add', protect, cartController.addToCart);
router.put('/update', protect, cartController.updateQuantity);
router.post('/remove', protect, cartController.removeFromCart); // Using POST for remove usually, or DELETE with ID
router.delete('/', protect, cartController.clearCart);

module.exports = router;

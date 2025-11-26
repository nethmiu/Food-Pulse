const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser); // සාමාන්‍ය අයට register වෙන්න
router.post('/login', loginUser);       // Login වෙන්න

// Admin විසින් අනිත් අයව register කරන route එක (Protected)
// Frontend එකේදී Admin Dashboard එක හරහා මෙය භාවිතා වේ.
router.post('/admin/register', protect, adminOnly, registerUser);

module.exports = router;
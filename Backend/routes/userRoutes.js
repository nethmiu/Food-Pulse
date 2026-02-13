
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getRestaurantStatus, updateRestaurantStatus, getRestaurantProfile, updateRestaurantProfile, deleteRestaurantAccount, changePassword, getAllRestaurants } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser); // සාමාන්‍ය අයට register වෙන්න
router.post('/login', loginUser);       // Login වෙන්න
router.get('/restaurants', getAllRestaurants); // Get all open restaurants (Public/Protected based on need, making it public/semi-protected mostly fine but let's keep it open for now or protect if needed. Plan said protect? Plan didn't specify, but customer flow usually protect. Let's add protect if they need to be logged in effectively.)
// Actually customer is logged in, so protect is fine.

// Admin විසින් අනිත් අයව register කරන route එක (Protected)
// Frontend එකේදී Admin Dashboard එක හරහා මෙය භාවිතා වේ.
router.post('/admin/register', protect, adminOnly, registerUser);

// Restaurant Status Routes
router.get('/status', protect, getRestaurantStatus);
router.put('/status/update', protect, updateRestaurantStatus);

// Profile Routes
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/profile', protect, getRestaurantProfile);
router.put('/profile/update', protect, upload.single('image'), updateRestaurantProfile);
router.put('/profile/password', protect, changePassword);
router.delete('/profile/delete', protect, deleteRestaurantAccount);

module.exports = router;
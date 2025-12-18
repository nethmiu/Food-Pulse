
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getRestaurantStatus, updateRestaurantStatus, getRestaurantProfile, updateRestaurantProfile, deleteRestaurantAccount, changePassword } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser); // සාමාන්‍ය අයට register වෙන්න
router.post('/login', loginUser);       // Login වෙන්න

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
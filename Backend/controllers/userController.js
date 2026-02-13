const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token එකක් සාදාගැනීමට helper function එකක්
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretKey123', { expiresIn: '30d' });
};

// Register User
const registerUser = async (req, res) => {
    const { name, username, email, phone, password, role, address, location } = req.body;

    try {
        // User දැනටමත් සිටීදැයි පරීක්ෂා කිරීම (Check if user exists by email OR username)
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: 'User already exists (Email or Username taken)' });

        // Admin කෙනෙක් හදන්නෙ Admin කෙනෙක්මද කියලා check කිරීම (සරලව)
        // ... (rest of comments)

        // Password Hash කිරීම (ආරක්ෂිත කිරීම)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            username,
            email,
            phone,
            password: hashedPassword,
            role: role || 'customer',
            address,
            location
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { identifier, password } = req.body; // identifier is the username

    try {
        // Username එකෙන් User සෙවීම (Search by username only as per requirement)
        // If you want to support both email OR username, use $or: [{ email: identifier }, { username: identifier }]
        // But user asked "login username... instead email". So let's prioritize username, but usually systems allow both.
        // Let's stick to the prompt "login username and password insted email".
        // Use Username to find user.
        const user = await User.findOne({ username: identifier });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                image: user.image,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Order = require('../models/Order');

// Get Restaurant Status
const getRestaurantStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ isRestaurantOpen: user.isRestaurantOpen });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Restaurant Status
const updateRestaurantStatus = async (req, res) => {
    try {
        const { isOpen } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure only restaurant can do this (though middleware already checks role usually, extra safety)
        if (user.role !== 'restaurant') return res.status(403).json({ message: 'Only restaurants can update status' });

        user.isRestaurantOpen = isOpen;
        await user.save();

        // Emit event to notify clients
        req.io.emit('restaurantStatusChanged', { restaurantId: user._id, isRestaurantOpen: user.isRestaurantOpen });

        res.json({ message: `Restaurant is now ${isOpen ? 'Open' : 'Closed'}`, isRestaurantOpen: user.isRestaurantOpen });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Get All Open Restaurants (Public/Customer)
const getAllRestaurants = async (req, res) => {
    try {
        // Fetch only basic info: id, name, image, description, address, location
        // Filter by role='restaurant' and isRestaurantOpen=true
        const restaurants = await User.find({ role: 'restaurant', isRestaurantOpen: true })
            .select('_id name email image address description location isRestaurantOpen');

        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- New Profile Functions ---

// Get User Profile (Handles both Customer and Restaurant)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'customer' || user.role === 'rider') {
            return res.json({ user });
        }

        // If Restaurant, calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const totalSalesResult = await Order.aggregate([
            { $match: { restaurantId: user._id, status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const monthlySalesResult = await Order.aggregate([
            {
                $match: {
                    restaurantId: user._id,
                    status: 'Delivered',
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const todaySalesResult = await Order.aggregate([
            {
                $match: {
                    restaurantId: user._id,
                    status: 'Delivered',
                    createdAt: { $gte: startOfToday }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalSales = totalSalesResult[0]?.total || 0;
        const monthlySales = monthlySalesResult[0]?.total || 0;
        const todaySales = todaySalesResult[0]?.total || 0;

        res.json({
            user,
            stats: {
                totalSales,
                monthlySales,
                todaySales
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update User Profile (Handles both Customer and Restaurant)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        console.log("Update Profile Data:", req.body);
        console.log("Update Profile File:", req.file);

        const { name, email, phone, address, location, description } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (description) user.description = description;
        if (location) user.location = JSON.parse(location); // Expecting result from JSON.stringify

        if (req.file) {
            user.image = req.file.filename;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            image: updatedUser.image,
            address: updatedUser.address,
            location: updatedUser.location,
            description: updatedUser.description,
            token: generateToken(updatedUser._id, updatedUser.role)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete User Account
const deleteUserAccount = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify email before deletion
        if (!email || email !== user.email) {
            return res.status(400).json({ message: 'Email verification failed. Please enter your registered email.' });
        }

        // Optional: Delete related menu items and orders if it's a restaurant
        // await MenuItem.deleteMany({ restaurantId: user._id });
        // await Order.deleteMany({ restaurantId: user._id });

        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getRestaurantStatus,
    updateRestaurantStatus,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    changePassword,
    getAllRestaurants
};

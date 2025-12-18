const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token එකක් සාදාගැනීමට helper function එකක්
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretKey123', { expiresIn: '30d' });
};

// Register User
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // User දැනටමත් සිටීදැයි පරීක්ෂා කිරීම
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Admin කෙනෙක් හදන්නෙ Admin කෙනෙක්මද කියලා check කිරීම (සරලව)
        // Note: මෙය Frontend එකෙන් admin ව select කිරීමේදී පාලනය කල හැක.
        // නමුත් ආරක්ෂාවට මෙතන check එකක් දැමිය හැක.

        // Password Hash කිරීම (ආරක්ෂිත කිරීම)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
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
    const { identifier, password } = req.body; // identifier can be email or name

    try {
        // Email එකෙන් හෝ Name එකෙන් User සෙවීම
        const user = await User.findOne({
            $or: [{ email: identifier }, { name: identifier }]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            });
        } else {
            res.status(401).json({ message: 'Invalid email/username or password' });
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

        res.json({ message: `Restaurant is now ${isOpen ? 'Open' : 'Closed'}`, isRestaurantOpen: user.isRestaurantOpen });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- New Profile Functions ---

// Get Restaurant Profile & Stats
const getRestaurantProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate Stats
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

// Update Restaurant Profile
const updateRestaurantProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, address, location, description } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
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

// Delete Restaurant Account
const deleteRestaurantAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Optional: Delete related menu items and orders?
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
    getRestaurantProfile,
    updateRestaurantProfile,
    deleteRestaurantAccount,
    changePassword
};

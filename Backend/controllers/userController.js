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

module.exports = { registerUser, loginUser };
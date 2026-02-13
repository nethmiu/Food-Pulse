const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey123');
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin පමණක් ඇතුළු විය හැකි තැන් සදහා
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const restaurantOnly = (req, res, next) => {
    if (req.user && req.user.role === 'restaurant') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a restaurant' });
    }
};

const riderOnly = (req, res, next) => {
    if (req.user && req.user.role === 'rider') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a rider' });
    }
};

module.exports = { protect, adminOnly, restaurantOnly, riderOnly };
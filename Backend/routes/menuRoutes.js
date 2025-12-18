const express = require('express');
const router = express.Router();
const multer = require('multer');
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/authMiddleware'); // Login වෙලාද බලන්න

const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Image Upload Settings (Multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // පින්තූර save වෙන්නේ 'uploads' ෆෝල්ඩරයට
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // පින්තූරෙට අලුත් නමක් දෙනවා (duplicate නොවෙන්න)
    }
});

const upload = multer({ storage: storage });

// Route: Add Menu Item
// 'image' කියන්නේ frontend එකෙන් එවන file input එකේ name එක
router.post('/add', protect, upload.single('image'), async (req, res) => {
    const { name, price, category } = req.body;
    const image = req.file ? req.file.filename : null; // Save වුන පින්තූරේ නම ගන්නවා

    if (!name || !price || !category || !image) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const newItem = await MenuItem.create({
            restaurantId: req.user.id, // Login වී සිටින Restaurant එකේ ID එක
            name,
            price,
            category,
            image
        });
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route: Get All Menu Items (Logged in restaurant එකේ කෑම ටික විතරක් ගන්න)
router.get('/my-menu', protect, async (req, res) => {
    try {
        const items = await MenuItem.find({ restaurantId: req.user.id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route: Update Menu Item
router.put('/update/:id', protect, upload.single('image'), async (req, res) => {
    const { name, price, category } = req.body;
    const image = req.file ? req.file.filename : undefined;

    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Check if the user owns this item
        if (menuItem.restaurantId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        menuItem.name = name || menuItem.name;
        menuItem.price = price || menuItem.price;
        menuItem.category = category || menuItem.category;
        if (image) {
            menuItem.image = image;
        }

        const updatedItem = await menuItem.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route: Delete Menu Item
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Check if the user owns this item
        if (menuItem.restaurantId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await MenuItem.findByIdAndDelete(req.params.id);

        res.json({ message: 'Menu item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
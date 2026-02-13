const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.menuItemId');
        if (!cart) {
            return res.status(200).json([]); // Return empty array if no cart
        }
        // Transform to format expected by frontend if needed, or return cart
        // Frontend expects: [{ _id, name, price, quantity, restaurantId, image }]
        // We will do this transformation here to minimize frontend changes
        const formattedCart = cart.items.map(item => {
            if (!item.menuItemId) return null; // Handle deleted menu items safely
            return {
                _id: item.menuItemId._id,
                name: item.menuItemId.name,
                price: item.menuItemId.price, // Use current price from menu item
                image: item.menuItemId.image,
                quantity: item.quantity,
                restaurantId: item.restaurantId, // Use item's restaurantId
                category: item.menuItemId.category
            };
        }).filter(item => item !== null);

        res.json(formattedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addToCart = async (req, res) => {
    const { menuItemId, quantity, restaurantId } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        const menuItem = await MenuItem.findById(menuItemId);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId: req.user.id,
                items: [{
                    menuItemId,
                    restaurantId, // Add restaurantId to item
                    quantity,
                    price: menuItem.price,
                    name: menuItem.name,
                    image: menuItem.image
                }]
            });
        } else {
            // Check if item exists
            const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;
                // Optional: Update price if changed? 
                // cart.items[itemIndex].price = menuItem.price; 
            } else {
                // Add new item (can be from any restaurant now)
                cart.items.push({
                    menuItemId,
                    restaurantId, // Add restaurantId to item
                    quantity,
                    price: menuItem.price,
                    name: menuItem.name,
                    image: menuItem.image
                });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateQuantity = async (req, res) => {
    const { menuItemId, quantity } = req.body; // quantity is the NEW quantity, or delta?
    // Frontend `updateQuantity` logic uses "change" (+1 or -1). 
    // But `setCart` sets the absolute value.
    // Let's assume we send 'change' or absolute? 
    // Frontend snippet: `updateQuantity(item._id, 1)` -> adds 1.
    // Ideally API should just take the absolute quantity or a delta.
    // Let's implement set absolute quantity for idempotency.

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item => item.menuItemId.toString() === menuItemId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                cart.items = cart.items.filter(i => i.menuItemId.toString() !== menuItemId);
            }
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeFromCart = async (req, res) => {
    const { menuItemId } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = cart.items.filter(item => item.menuItemId.toString() !== menuItemId);
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await Cart.deleteOne({ userId: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

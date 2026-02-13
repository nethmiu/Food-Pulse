const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Place Order
// Place Order (Supports Mixed Carts)
const createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        // restaurantId from body is ignored now, we derive it from items

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Group items by restaurantId
        const ordersByRestaurant = {};

        items.forEach(item => {
            if (!ordersByRestaurant[item.restaurantId]) {
                ordersByRestaurant[item.restaurantId] = [];
            }
            ordersByRestaurant[item.restaurantId].push(item);
        });

        const createdOrders = [];

        for (const restaurantId of Object.keys(ordersByRestaurant)) {
            const restaurantItems = ordersByRestaurant[restaurantId];

            // Calculate total for this restaurant
            const totalAmount = restaurantItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            const order = await Order.create({
                restaurantId,
                customerId: req.user.id,
                items: restaurantItems.map(i => ({
                    menuItemId: i.menuItemId,
                    quantity: i.quantity,
                    price: i.price
                })),
                totalAmount
            });
            createdOrders.push(order);
        }

        res.status(201).json(createdOrders);
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get User Orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('restaurantId', 'name')
            .populate('items.menuItemId', 'name');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders
};

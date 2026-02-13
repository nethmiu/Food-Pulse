const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
        {
            menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
            restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true },
            name: { type: String },
            image: { type: String }
        }
    ],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);

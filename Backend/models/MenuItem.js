const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // කෑම එක අයිති restaurant එක
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true } // Image එකේ නම හෝ පාත් එක මෙතන store වෙනවා
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'restaurant', 'rider', 'admin'],
        default: 'customer'
    },
    isRestaurantOpen: { type: Boolean, default: false },
    image: { type: String }, // URL or filename
    address: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    description: { type: String }
});

module.exports = mongoose.model("User", userSchema);
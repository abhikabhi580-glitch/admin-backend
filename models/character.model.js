const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String },
    age: { type: Number },
    description: { type: String },
    ability: { type: String },
    redeemed: { type: Number, default: 0 },
    image: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Character', characterSchema);

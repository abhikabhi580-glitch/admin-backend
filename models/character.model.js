const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sub_title: { type: String },
    line: { type: String },
    badge: { type: String },
    birthday: { type: String },
    gender: { type: String },
    age: { type: Number },
    bio_description: { type: String },
    description: { type: String },
    ability: { type: String },
    redeemed: { type: Number, default: 0 },
    image: { type: String }, // Cloudinary image URL
    imagePublicId: { type: String }, // Cloudinary public_id for management
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Character', characterSchema);

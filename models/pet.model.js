const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sub_title: { type: String },
    description: { type: String },
    ability: { type: String },
    image: { type: String },           // Cloudinary image URL
    imagePublicId: { type: String },   // Cloudinary public ID for deleting/updating
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', petSchema);

const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sub_title: { type: String },
    description: { type: String },
    ability: { type: String },
    image: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', petSchema);

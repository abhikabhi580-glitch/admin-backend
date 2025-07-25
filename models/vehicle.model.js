const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hp: { type: String },
    acceleration_torque: { type: String },
    speed: { type: String },
    control: { type: String },
    seats: { type: String },
    ideal_use_case: { type: String },
    image: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);

const Vehicle = require('../models/vehicle.model');
const fs = require('fs');

// Delete image helper
const deleteImage = (imagePath) => {
    if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

// Create
exports.createVehicle = async (req, res) => {
    try {
        const {
            name, hp, acceleration_torque, speed,
            control, seats, ideal_use_case
        } = req.body;

        const imagePath = req.file ? req.file.path : null;

        const newVehicle = new Vehicle({
            name,
            hp,
            acceleration_torque,
            speed,
            control,
            seats,
            ideal_use_case,
            image: imagePath,
            created_at: new Date()
        });

        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ created_at: -1 });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get by ID
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Not found' });

        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Not found' });

        if (req.file) {
            deleteImage(vehicle.image);
            vehicle.image = req.file.path;
        }

        const fields = ['name', 'hp', 'acceleration_torque', 'speed', 'control', 'seats', 'ideal_use_case'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                vehicle[field] = req.body[field];
            }
        });

        await vehicle.save();
        res.json({ message: 'Vehicle updated', vehicle });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Not found' });

        deleteImage(vehicle.image);
        await vehicle.deleteOne();

        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

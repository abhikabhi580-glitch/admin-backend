const Vehicle = require('../models/vehicle.model');
const cloudinary = require('../config/cloudinary');

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }
};

// Create Vehicle
exports.createVehicle = async (req, res) => {
    try {
        const {
            name, hp, acceleration_torque, speed,
            control, seats, ideal_use_case
        } = req.body;

        const newVehicle = new Vehicle({
            name,
            hp,
            acceleration_torque,
            speed,
            control,
            seats,
            ideal_use_case,
            created_at: new Date()
        });

        await newVehicle.save();

        // Upload image if provided
        if (req.file?.path) {
            const upload = await cloudinary.uploader.upload(req.file.path, {
                public_id: `vehicle/${newVehicle._id}`,
                overwrite: true,
            });

            newVehicle.image = upload.secure_url;
            newVehicle.imagePublicId = upload.public_id;
            await newVehicle.save();
        }

        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ created_at: -1 });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Vehicle By ID
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        const fields = ['name', 'hp', 'acceleration_torque', 'speed', 'control', 'seats', 'ideal_use_case'];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                vehicle[field] = req.body[field];
            }
        });

        // Replace image if new one is uploaded
        if (req.file?.path) {
            await deleteImage(vehicle.imagePublicId);

            const upload = await cloudinary.uploader.upload(req.file.path, {
                public_id: `vehicle/${vehicle._id}`,
                overwrite: true,
            });

            vehicle.image = upload.secure_url;
            vehicle.imagePublicId = upload.public_id;
        }

        await vehicle.save();
        res.json({ message: 'Vehicle updated', vehicle });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        await deleteImage(vehicle.imagePublicId);
        await vehicle.deleteOne();

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

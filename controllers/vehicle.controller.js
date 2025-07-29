const Vehicle = require('../models/vehicle.model');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, publicId) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder: 'admin-panel/vehicle',
                overwrite: true,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Helper: Delete from Cloudinary
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }
};

// CREATE Vehicle
exports.createVehicle = async (req, res) => {
    try {
        const {
            name,
            hp,
            acceleration_torque,
            speed,
            control,
            seats,
            ideal_use_case,
        } = req.body;

        const newVehicle = await Vehicle.create({
            name,
            hp,
            acceleration_torque,
            speed,
            control,
            seats,
            ideal_use_case,
            created_at: new Date(),
        });

        if (req.file?.buffer) {
            const upload = await uploadToCloudinary(req.file.buffer, `${newVehicle.id}`);
            newVehicle.image = upload.secure_url;
            newVehicle.imagePublicId = upload.public_id;
            await newVehicle.save();
        }

        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET All Vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({ order: [['created_at', 'DESC']] });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Vehicle By ID
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE Vehicle
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        const fields = [
            'name',
            'hp',
            'acceleration_torque',
            'speed',
            'control',
            'seats',
            'ideal_use_case',
        ];

        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                vehicle[field] = req.body[field];
            }
        });

        if (req.file?.buffer) {
            await deleteImage(vehicle.imagePublicId);
            const upload = await uploadToCloudinary(req.file.buffer, `${vehicle.id}`);
            vehicle.image = upload.secure_url;
            vehicle.imagePublicId = upload.public_id;
        }

        await vehicle.save();
        res.json({ message: 'Vehicle updated', vehicle });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE Vehicle
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

        await deleteImage(vehicle.imagePublicId);
        await vehicle.destroy();

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

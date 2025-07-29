const Vehicle = require('../models/vehicle.model');
const { uploadFile, deleteFile } = require('../services/ftpService');
const fs = require('fs');
const path = require('path');

// Helper: Write buffer to /temp folder
const writeTempFile = (filename, buffer) => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const tempPath = path.join(tempDir, filename);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
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
            const filename = `vehicle-${newVehicle.id}-${Date.now()}.jpg`;
            const tempPath = writeTempFile(filename, req.file.buffer);

            const remotePath = `/uploads/vehicles/${filename}`;
            await uploadFile(tempPath, remotePath);

            newVehicle.image = `${process.env.FILE_BASE_URL}/uploads/vehicles/${filename}`;
            newVehicle.imagePublicId = remotePath;
            await newVehicle.save();

            fs.unlinkSync(tempPath); // cleanup
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

// GET Vehicle by ID
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

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                vehicle[field] = req.body[field];
            }
        });

        if (req.file?.buffer) {
            if (vehicle.imagePublicId) {
                await deleteFile(vehicle.imagePublicId);
            }

            const filename = `vehicle-${vehicle.id}-${Date.now()}.jpg`;
            const tempPath = writeTempFile(filename, req.file.buffer);

            const remotePath = `/uploads/vehicles/${filename}`;
            await uploadFile(tempPath, remotePath);

            vehicle.image = `${process.env.FILE_BASE_URL}/uploads/vehicles/${filename}`;
            vehicle.imagePublicId = remotePath;

            fs.unlinkSync(tempPath); // cleanup
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

        if (vehicle.imagePublicId) {
            await deleteFile(vehicle.imagePublicId);
        }

        await vehicle.destroy();
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Helper: Delete image from Cloudinary
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }
};

// CREATE VEHICLE
exports.createVehicle = async (req, res) => {
    try {
        const {
            name, hp, acceleration_torque,
            speed, control, seats, ideal_use_case
        } = req.body;

        // Step 1: Insert into DB without image
        const insertSql = `
            INSERT INTO vehicles 
            (name, hp, acceleration_torque, speed, control, seats, ideal_use_case, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(insertSql, [
            name, hp, acceleration_torque, speed, control, seats, ideal_use_case
        ]);

        const vehicleId = result.insertId;
        let imageUrl = null;
        let imagePublicId = null;

        // Step 2: Upload image
        if (req.file?.path) {
            const upload = await cloudinary.uploader.upload(req.file.path, {
                public_id: `admin-panel/vehicle/${vehicleId}`,
                overwrite: true
            });

            imageUrl = upload.secure_url;
            imagePublicId = upload.public_id;

            // Step 3: Update DB with image
            const updateSql = `UPDATE vehicles SET image = ?, imagePublicId = ? WHERE id = ?`;
            await db.execute(updateSql, [imageUrl, imagePublicId, vehicleId]);
        }

        const [rows] = await db.execute(`SELECT * FROM vehicles WHERE id = ?`, [vehicleId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL VEHICLES
exports.getAllVehicles = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM vehicles ORDER BY created_at DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET VEHICLE BY ID
exports.getVehicleById = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM vehicles WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE VEHICLE
exports.updateVehicle = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM vehicles WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

        const vehicle = rows[0];
        const {
            name = vehicle.name,
            hp = vehicle.hp,
            acceleration_torque = vehicle.acceleration_torque,
            speed = vehicle.speed,
            control = vehicle.control,
            seats = vehicle.seats,
            ideal_use_case = vehicle.ideal_use_case
        } = req.body;

        // Step 1: Update fields
        await db.execute(`
            UPDATE vehicles 
            SET name = ?, hp = ?, acceleration_torque = ?, speed = ?, control = ?, seats = ?, ideal_use_case = ? 
            WHERE id = ?
        `, [name, hp, acceleration_torque, speed, control, seats, ideal_use_case, req.params.id]);

        // Step 2: Upload new image if provided
        if (req.file?.path) {
            await deleteImage(vehicle.imagePublicId);

            const upload = await cloudinary.uploader.upload(req.file.path, {
                public_id: `admin-panel/vehicle/${req.params.id}`,
                overwrite: true
            });

            await db.execute(`
                UPDATE vehicles 
                SET image = ?, imagePublicId = ? 
                WHERE id = ?
            `, [upload.secure_url, upload.public_id, req.params.id]);
        }

        const [updated] = await db.execute(`SELECT * FROM vehicles WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Vehicle updated', vehicle: updated[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE VEHICLE
exports.deleteVehicle = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM vehicles WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

        await deleteImage(rows[0].imagePublicId);
        await db.execute(`DELETE FROM vehicles WHERE id = ?`, [req.params.id]);

        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const db = require('../config/db'); // MySQL connection
const cloudinary = require('../config/cloudinary');

// Helper to delete Cloudinary image
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }
};

// CREATE PET
exports.createPet = async (req, res) => {
    try {
        const { name, sub_title, description, ability } = req.body;

        // Step 1: Insert basic data (no image yet)
        const insertSql = `INSERT INTO pets (name, sub_title, description, ability, created_at) VALUES (?, ?, ?, ?, NOW())`;
        const [result] = await db.execute(insertSql, [name, sub_title, description, ability]);

        const insertedId = result.insertId;
        let imageUrl = null;
        let imagePublicId = null;

        // Step 2: Upload image to Cloudinary
        if (req.file?.path) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `admin-panel/pet/${insertedId}`,
                overwrite: true
            });

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;

            // Step 3: Update DB with image
            const updateSql = `UPDATE pets SET image = ?, imagePublicId = ? WHERE id = ?`;
            await db.execute(updateSql, [imageUrl, imagePublicId, insertedId]);
        }

        // Final response
        const [rows] = await db.execute(`SELECT * FROM pets WHERE id = ?`, [insertedId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL PETS
exports.getAllPets = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM pets ORDER BY created_at DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET PET BY ID
exports.getPetById = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM pets WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Pet not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE PET
exports.updatePet = async (req, res) => {
    try {
        const [existingRows] = await db.execute(`SELECT * FROM pets WHERE id = ?`, [req.params.id]);
        if (existingRows.length === 0) return res.status(404).json({ error: 'Pet not found' });

        const pet = existingRows[0];
        const { name, sub_title, description, ability } = req.body;

        // Update fields
        const updateFields = `UPDATE pets SET name = ?, sub_title = ?, description = ?, ability = ? WHERE id = ?`;
        await db.execute(updateFields, [name, sub_title, description, ability, req.params.id]);

        // Handle new image
        if (req.file?.path) {
            await deleteImage(pet.imagePublicId);

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `admin-panel/pet/${req.params.id}`,
                overwrite: true
            });

            const imageUrl = uploadResult.secure_url;
            const imagePublicId = uploadResult.public_id;

            await db.execute(
                `UPDATE pets SET image = ?, imagePublicId = ? WHERE id = ?`,
                [imageUrl, imagePublicId, req.params.id]
            );
        }

        const [updatedPet] = await db.execute(`SELECT * FROM pets WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Pet updated', pet: updatedPet[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE PET
exports.deletePet = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM pets WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Pet not found' });

        const pet = rows[0];

        // Delete image from Cloudinary
        await deleteImage(pet.imagePublicId);

        // Delete from DB
        await db.execute(`DELETE FROM pets WHERE id = ?`, [req.params.id]);

        res.json({ message: 'Pet deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

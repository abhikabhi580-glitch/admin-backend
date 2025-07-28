const db = require('../config/db'); // Your mysql2 connection pool
const cloudinary = require('../config/cloudinary');

// Helper to delete image from Cloudinary
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Error deleting image from Cloudinary:', err.message);
        }
    }
};

// Create Character
exports.createCharacter = async (req, res) => {
    try {
        const {
            name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday
        } = req.body;

        // Step 1: Insert character without image to get ID
        const [result] = await db.execute(`
            INSERT INTO characters (name, sub_title, line, badge, gender, age, description, ability, redeemed, bio_description, birthday, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [name, sub_title, line, badge, gender, age, description, ability, redeemed || 0, bio_description, birthday]);

        const characterId = result.insertId;

        // Step 2: Upload image to Cloudinary
        let image = null;
        let imagePublicId = null;

        if (req.file?.path) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `admin-panel/character/${characterId}`,
                overwrite: true,
            });

            image = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;

            // Step 3: Update DB with image
            await db.execute(`
                UPDATE characters SET image = ?, imagePublicId = ? WHERE id = ?
            `, [image, imagePublicId, characterId]);
        }

        const [newCharacter] = await db.execute(`SELECT * FROM characters WHERE id = ?`, [characterId]);
        res.status(201).json(newCharacter[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get All Characters
exports.getAllCharacters = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM characters ORDER BY created_at DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Character by ID
exports.getCharacterById = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM characters WHERE id = ?`, [req.params.id]);

        if (rows.length === 0)
            return res.status(404).json({ error: 'Character not found' });

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Character
exports.updateCharacter = async (req, res) => {
    try {
        const [existingRows] = await db.execute(`SELECT * FROM characters WHERE id = ?`, [req.params.id]);
        if (existingRows.length === 0)
            return res.status(404).json({ error: 'Character not found' });

        const character = existingRows[0];

        const {
            name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday
        } = req.body;

        // Handle image update
        let image = character.image;
        let imagePublicId = character.imagePublicId;

        if (req.file?.path) {
            await deleteImage(imagePublicId);

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `admin-panel/character/${character.id}`,
                overwrite: true,
            });

            image = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        // Update DB
        await db.execute(`
            UPDATE characters SET
                name = ?, sub_title = ?, line = ?, badge = ?, gender = ?, age = ?,
                description = ?, ability = ?, redeemed = ?, bio_description = ?, birthday = ?,
                image = ?, imagePublicId = ?
            WHERE id = ?
        `, [
            name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday,
            image, imagePublicId, req.params.id
        ]);

        const [updatedRows] = await db.execute(`SELECT * FROM characters WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Character updated', character: updatedRows[0] });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Character
exports.deleteCharacter = async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM characters WHERE id = ?`, [req.params.id]);
        if (rows.length === 0)
            return res.status(404).json({ error: 'Character not found' });

        const character = rows[0];

        await deleteImage(character.imagePublicId);
        await db.execute(`DELETE FROM characters WHERE id = ?`, [req.params.id]);

        res.json({ message: 'Character deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

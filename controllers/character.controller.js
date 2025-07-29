const Character = require('../models/character.model');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: Upload image from buffer
const uploadToCloudinary = (buffer, publicId) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder: 'admin-panel/character',
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

// CREATE
exports.createCharacter = async (req, res) => {
    try {
        const { name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday } = req.body;

        const newCharacter = await Character.create({
            name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday,
            created_at: new Date(),
        });

        if (req.file?.buffer) {
            const result = await uploadToCloudinary(req.file.buffer, `${newCharacter.id}`);

            newCharacter.image = result.secure_url;
            newCharacter.imagePublicId = result.public_id;
            await newCharacter.save();
        }

        res.status(201).json(newCharacter);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ ALL
exports.getAllCharacters = async (req, res) => {
    try {
        const characters = await Character.findAll({ order: [['created_at', 'DESC']] });
        res.json(characters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ BY ID
exports.getCharacterById = async (req, res) => {
    try {
        const character = await Character.findByPk(req.params.id);
        if (!character) return res.status(404).json({ error: 'Character not found' });

        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
exports.updateCharacter = async (req, res) => {
    try {
        const character = await Character.findByPk(req.params.id);
        if (!character) return res.status(404).json({ error: 'Character not found' });

        const fields = ['name', 'sub_title', 'description', 'ability', 'line', 'badge', 'gender', 'age',
            'redeemed', 'bio_description', 'birthday'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                character[field] = req.body[field];
            }
        });

        // Replace image if new one provided
        if (req.file?.buffer) {
            await deleteImage(character.imagePublicId);

            const result = await uploadToCloudinary(req.file.buffer, `${character.id}`);
            character.image = result.secure_url;
            character.imagePublicId = result.public_id;
        }

        await character.save();
        res.json({ message: 'Character updated', character });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.deleteCharacter = async (req, res) => {
    try {
        const character = await Character.findByPk(req.params.id);
        if (!character) return res.status(404).json({ error: 'Character not found' });

        await deleteImage(character.imagePublicId);
        await character.destroy();

        res.json({ message: 'Character deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

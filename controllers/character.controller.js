const Character = require('../models/character.model');
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
            description, ability, redeemed, bio_description,
            birthday
        } = req.body;

        // Step 1: Create character without image to get ID
        const tempChar = new Character({
            name,
            sub_title,
            line,
            badge,
            gender,
            age,
            description,
            ability,
            redeemed,
            bio_description,
            birthday,
            created_at: new Date(),
        });

        await tempChar.save(); // saves & generates _id

        // Step 2: Upload image to Cloudinary using character ID as public_id
        let imageUrl = null;
        let imagePublicId = null;

        if (req.file?.path) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `character/${tempChar._id}`,
                overwrite: true,
            });

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        // Step 3: Update character with image info
        tempChar.image = imageUrl;
        tempChar.imagePublicId = imagePublicId;

        await tempChar.save();

        res.status(201).json(tempChar);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get all characters
exports.getAllCharacters = async (req, res) => {
    try {
        const characters = await Character.find().sort({ created_at: -1 });
        res.json(characters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single character
exports.getCharacterById = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ error: 'Character not found' });

        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update character
exports.updateCharacter = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ error: 'Character not found' });

        const updatableFields = [
            'name', 'sub_title', 'line', 'badge', 'gender',
            'age', 'description', 'ability', 'redeemed', 'bio_description', 'birthday'
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                character[field] = req.body[field];
            }
        });

        // Handle new image upload
        if (req.file?.path) {
            await deleteImage(character.imagePublicId);

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `character/${character._id}`,
                overwrite: true,
            });

            character.image = uploadResult.secure_url;
            character.imagePublicId = uploadResult.public_id;
        }

        await character.save();

        res.json({ message: 'Character updated', character });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete character
exports.deleteCharacter = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ error: 'Character not found' });

        await deleteImage(character.imagePublicId);
        await character.deleteOne();

        res.json({ message: 'Character deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

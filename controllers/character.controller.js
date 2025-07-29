const Character = require('../models/character.model');
const { uploadFile, deleteFile } = require('../services/ftpService');
const fs = require('fs');
const path = require('path');

// Helper: Write buffer to /temp and ensure the folder exists
const writeTempFile = (filename, buffer) => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const tempPath = path.join(tempDir, filename);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
};

// CREATE
exports.createCharacter = async (req, res) => {
    try {
        const {
            name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday
        } = req.body;

        const newCharacter = await Character.create({
            name, sub_title, line, badge, gender, age,
            description, ability, redeemed, bio_description, birthday,
            created_at: new Date(),
        });

        if (req.file?.buffer) {
            const filename = `character-${newCharacter.id}-${Date.now()}.jpg`;
            const tempPath = writeTempFile(filename, req.file.buffer);

            const remotePath = `/uploads/characters/${filename}`;
            await uploadFile(tempPath, remotePath);

            newCharacter.image = `${process.env.FILE_BASE_URL}/uploads/characters/${filename}`;
            newCharacter.imagePublicId = remotePath;
            await newCharacter.save();

            fs.unlinkSync(tempPath); // Delete local temp file
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

        if (req.file?.buffer) {
            // Delete old image if exists
            if (character.imagePublicId) {
                await deleteFile(character.imagePublicId);
            }

            const filename = `character-${character.id}-${Date.now()}.jpg`;
            const tempPath = writeTempFile(filename, req.file.buffer);

            const remotePath = `/uploads/characters/${filename}`;
            await uploadFile(tempPath, remotePath);

            character.image = `${process.env.FILE_BASE_URL}/uploads/characters/${filename}`;
            character.imagePublicId = remotePath;

            fs.unlinkSync(tempPath); // Clean temp file
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

        if (character.imagePublicId) {
            await deleteFile(character.imagePublicId);
        }

        await character.destroy();
        res.json({ message: 'Character deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

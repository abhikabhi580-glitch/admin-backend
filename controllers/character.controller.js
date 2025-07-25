const Character = require('../models/character.model');
const fs = require('fs');
const path = require('path');

// Helper to delete image
const deleteImage = (imagePath) => {
    if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

// Create Character
exports.createCharacter = async (req, res) => {
    try {
        const {
            name, gender, age, description,
            ability, redeemed
        } = req.body;

        const imagePath = req.file ? req.file.path : null;

        const newChar = new Character({
            name,
            gender,
            age,
            description,
            ability,
            redeemed,
            image: imagePath,
            created_at: new Date(),
        });

        await newChar.save();
        res.status(201).json(newChar);
    } catch (err) {
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

// Get single character by ID
exports.getCharacterById = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ error: 'Not found' });

        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update character
exports.updateCharacter = async (req, res) => {
    try {
        const character = await Character.findById(req.params.id);
        if (!character) return res.status(404).json({ error: 'Not found' });

        if (req.file) {
            deleteImage(character.image);
            character.image = req.file.path;
        }

        // Update fields
        const fields = ['name', 'gender', 'age', 'description', 'ability', 'redeemed'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                character[field] = req.body[field];
            }
        });

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
        if (!character) return res.status(404).json({ error: 'Not found' });

        deleteImage(character.image);
        await character.deleteOne();

        res.json({ message: 'Character deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

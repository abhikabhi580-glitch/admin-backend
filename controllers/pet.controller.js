const Pet = require('../models/pet.model');
const fs = require('fs');

// Delete image helper
const deleteImage = (imagePath) => {
    if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

// Create
exports.createPet = async (req, res) => {
    try {
        const { name, sub_title, description, ability } = req.body;
        const imagePath = req.file ? req.file.path : null;

        const newPet = new Pet({
            name,
            sub_title,
            description,
            ability,
            image: imagePath,
            created_at: new Date()
        });

        await newPet.save();
        res.status(201).json(newPet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All
exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pet.find().sort({ created_at: -1 });
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get By ID
exports.getPetById = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Not found' });

        res.json(pet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Not found' });

        if (req.file) {
            deleteImage(pet.image);
            pet.image = req.file.path;
        }

        const fields = ['name', 'sub_title', 'description', 'ability'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                pet[field] = req.body[field];
            }
        });

        await pet.save();
        res.json({ message: 'Pet updated', pet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Not found' });

        deleteImage(pet.image);
        await pet.deleteOne();

        res.json({ message: 'Pet deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

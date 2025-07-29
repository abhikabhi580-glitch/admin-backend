const Pet = require('../models/pet.model');
const { uploadFile, deleteFile } = require('../services/ftpService');
const fs = require('fs');
const path = require('path');

// Helper: Write buffer to /temp
const writeTempFile = (filename, buffer) => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const tempPath = path.join(tempDir, filename);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
};

// CREATE Pet
exports.createPet = async (req, res) => {
    try {
        const { name, sub_title, description, ability } = req.body;

        const newPet = await Pet.create({
            name,
            sub_title,
            description,
            ability,
            created_at: new Date(),
        });

        if (req.file?.buffer) {
            const filename = `pet-${newPet.id}-${Date.now()}.jpg`;
            const tempPath = writeTempFile(filename, req.file.buffer);

            const remotePath = `/uploads/pets/${filename}`;
            await uploadFile(tempPath, remotePath);

            newPet.image = `${process.env.FILE_BASE_URL}/uploads/pets/${filename}`;
            newPet.imagePublicId = remotePath;
            await newPet.save();

            fs.unlinkSync(tempPath); // Clean up temp file
        }

        res.status(201).json(newPet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ ALL Pets
exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pet.findAll({ order: [['created_at', 'DESC']] });
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ Pet by ID
exports.getPetById = async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        res.json(pet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE Pet
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        const fields = ['name', 'sub_title', 'description', 'ability'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                pet[field] = req.body[field];
            }
        });

        if (req.file?.buffer) {
            if (pet.imagePublicId) {
                await deleteFile(pet.imagePublicId);
            }

            const filename = `pet-${pet.id}-${Date.now()}.jpg`;
            const tempPath = writeTempFile(filename, req.file.buffer);

            const remotePath = `/uploads/pets/${filename}`;
            await uploadFile(tempPath, remotePath);

            pet.image = `${process.env.FILE_BASE_URL}/uploads/pets/${filename}`;
            pet.imagePublicId = remotePath;

            fs.unlinkSync(tempPath); // Delete temp file
        }

        await pet.save();
        res.json({ message: 'Pet updated', pet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE Pet
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findByPk(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        if (pet.imagePublicId) {
            await deleteFile(pet.imagePublicId);
        }

        await pet.destroy();
        res.json({ message: 'Pet deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

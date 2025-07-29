const Pet = require('../models/pet.model');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: Upload image from buffer
const uploadToCloudinary = (buffer, publicId) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                folder: 'admin-panel/pet',
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

// Helper: Delete Cloudinary image
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }
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
            const result = await uploadToCloudinary(req.file.buffer, `${newPet.id}`);
            newPet.image = result.secure_url;
            newPet.imagePublicId = result.public_id;
            await newPet.save();
        }

        res.status(201).json(newPet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ All Pets
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
            await deleteImage(pet.imagePublicId);
            const result = await uploadToCloudinary(req.file.buffer, `${pet.id}`);
            pet.image = result.secure_url;
            pet.imagePublicId = result.public_id;
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

        await deleteImage(pet.imagePublicId);
        await pet.destroy();

        res.json({ message: 'Pet deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

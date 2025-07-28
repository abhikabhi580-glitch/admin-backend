const Pet = require('../models/pet.model');
const cloudinary = require('../config/cloudinary');

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }
};

// Create Pet
exports.createPet = async (req, res) => {
    try {
        const { name, sub_title, description, ability } = req.body;

        // Step 1: Save basic data to get _id
        const tempPet = new Pet({
            name,
            sub_title,
            description,
            ability,
            created_at: new Date(),
        });

        await tempPet.save();

        // Step 2: Upload image to Cloudinary
        let imageUrl = null;
        let imagePublicId = null;

        if (req.file?.path) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `pet/${tempPet._id}`,
                overwrite: true,
            });

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        // Step 3: Save image data
        tempPet.image = imageUrl;
        tempPet.imagePublicId = imagePublicId;
        await tempPet.save();

        res.status(201).json(tempPet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Pets
exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pet.find().sort({ created_at: -1 });
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Pet By ID
exports.getPetById = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        res.json(pet);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Pet
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        const fields = ['name', 'sub_title', 'description', 'ability'];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                pet[field] = req.body[field];
            }
        });

        // Upload new image
        if (req.file?.path) {
            await deleteImage(pet.imagePublicId);

            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: `pet/${pet._id}`,
                overwrite: true,
            });

            pet.image = uploadResult.secure_url;
            pet.imagePublicId = uploadResult.public_id;
        }

        await pet.save();
        res.json({ message: 'Pet updated', pet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Pet
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: 'Pet not found' });

        await deleteImage(pet.imagePublicId);
        await pet.deleteOne();

        res.json({ message: 'Pet deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

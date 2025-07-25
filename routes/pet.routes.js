const express = require('express');
const router = express.Router();

const controller = require('../controllers/pet.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Create
router.post('/', auth, upload.single('image'), controller.createPet);

// Read all
router.get('/', auth, controller.getAllPets);

// Read by ID
router.get('/:id', auth, controller.getPetById);

// Update
router.put('/:id', auth, upload.single('image'), controller.updatePet);

// Delete
router.delete('/:id', auth, controller.deletePet);

module.exports = router;

const express = require('express');
const router = express.Router();

const controller = require('../controllers/character.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Create
router.post('/', auth, upload.single('image'), controller.createCharacter);

// Read all
router.get('/', controller.getAllCharacters);

// Read by ID
router.get('/:id', auth, controller.getCharacterById);

// Update
router.put('/:id', auth, upload.single('image'), controller.updateCharacter);

// Delete
router.delete('/:id', auth, controller.deleteCharacter);

module.exports = router;

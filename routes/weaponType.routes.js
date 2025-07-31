const express = require('express');
const router = express.Router();

const controller = require('../controllers/weaponType.controller');
const auth = require('../middlewares/auth.middleware');

// Create
router.post('/', auth, controller.createWeaponType);

// Read all
router.get('/', controller.getAllWeaponType);

// Read by ID
router.get('/:id', auth, controller.getWeaponTypeById);

// Update
router.put('/:id', auth, controller.updateWeaponType);

// Delete
router.delete('/:id', auth, controller.deleteWeaponType);

module.exports = router;

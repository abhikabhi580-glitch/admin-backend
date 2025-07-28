const express = require('express');
const router = express.Router();

const controller = require('../controllers/vehicle.controller');
const auth = require('../middlewares/auth.middleware');
// const upload = require('../middlewares/upload.middleware');

// Create
router.post('/', auth,  controller.createVehicle);

// Read all
router.get('/', auth, controller.getAllVehicles);

// Read by ID
router.get('/:id', auth, controller.getVehicleById);

// Update
router.put('/:id', auth,  controller.updateVehicle);

// Delete
router.delete('/:id', auth, controller.deleteVehicle);

module.exports = router;

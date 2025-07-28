const Character = require('../models/character.model');
const Pet = require('../models/pet.model');
const Vehicle = require('../models/vehicle.model');

exports.getDashboardSummary = async (req, res) => {
    try {
        const totalCharacters = await Character.countDocuments();
        const totalPets = await Pet.countDocuments();
        const totalVehicles = await Vehicle.countDocuments();

        res.json({
            totalCharacters,
            totalPets,
            totalVehicles,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

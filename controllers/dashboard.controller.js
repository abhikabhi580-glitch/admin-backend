const Character = require('../models/character.model');
const Pet = require('../models/pet.model');
const Vehicle = require('../models/vehicle.model');

exports.getDashboardSummary = async (req, res) => {
    try {
        const totalCharacters = await Character.count();
        const totalPets = await Pet.count();
        const totalVehicles = await Vehicle.count();

        res.json({
            totalCharacters,
            totalPets,
            totalVehicles,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

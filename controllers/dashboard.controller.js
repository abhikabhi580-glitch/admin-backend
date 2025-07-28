const db = require('../config/db'); // your MySQL connection (using mysql2)

exports.getDashboardSummary = async (req, res) => {
    try {
        const [characterRows] = await db.promise().query("SELECT COUNT(*) AS totalCharacters FROM characters");
        const [petRows] = await db.promise().query("SELECT COUNT(*) AS totalPets FROM pets");
        const [vehicleRows] = await db.promise().query("SELECT COUNT(*) AS totalVehicles FROM vehicles");

        res.json({
            totalCharacters: characterRows[0].totalCharacters,
            totalPets: petRows[0].totalPets,
            totalVehicles: vehicleRows[0].totalVehicles,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

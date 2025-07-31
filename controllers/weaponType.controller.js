const WeaponType = require('../models/weaponType.model');

// CREATE WeaponType
exports.createWeaponType = async (req, res) => {
    try {
        const { name } = req.body;

        const newWeaponType = await WeaponType.create({
            name,
            created_at: new Date(),
        });

        res.status(201).json(newWeaponType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ ALL WeaponType
exports.getAllWeaponType = async (req, res) => {
    try {
        const weaponType = await WeaponType.findAll({ order: [['created_at', 'DESC']] });
        res.json(weaponType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ WeaponType by ID
exports.getWeaponTypeById = async (req, res) => {
    try {
        const weaponType = await WeaponType.findByPk(req.params.id);
        if (!weaponType) return res.status(404).json({ error: 'WeaponType not found' });

        res.json(weaponType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE WeaponType
exports.updateWeaponType = async (req, res) => {
    try {
        const weaponType = await WeaponType.findByPk(req.params.id);
        if (!weaponType) return res.status(404).json({ error: 'WeaponType not found' });

        const fields = ['name'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                weaponType[field] = req.body[field];
            }
        });

        await weaponType.save();
        res.json({ message: 'WeaponType updated', weaponType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE WeaponType
exports.deleteWeaponType = async (req, res) => {
    try {
        const weaponType = await WeaponType.findByPk(req.params.id);
        if (!weaponType) return res.status(404).json({ error: 'WeaponType not found' });
        await weaponType.destroy();
        res.json({ message: 'WeaponType deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

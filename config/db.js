const sequelize = require('./sequelize');
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected');

        // Load models AFTER sequelize is defined
        require('../models/character.model');
        require('../models/pet.model');
        require('../models/vehicle.model');

        await sequelize.sync({ alter: true });
        console.log('✅ Models synchronized');
    } catch (err) {
        console.error('❌ DB Error:', err.message);
        console.error(err); // <-- print the full error object
        console.error(JSON.stringify(err, null, 2)); // <-- even better: stringify it
        process.exit(1);
    }
};

module.exports = { connectDB, sequelize };

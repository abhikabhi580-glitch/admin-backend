const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes (we'll create them soon)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/characters', require('./routes/character.routes'));
app.use('/api/pets', require('./routes/pet.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/weapontype', require('./routes/weaponType.routes'));

module.exports = app;

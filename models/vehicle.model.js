const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Vehicle = sequelize.define('Vehicle', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hp: {
        type: DataTypes.STRING
    },
    acceleration_torque: {
        type: DataTypes.STRING
    },
    speed: {
        type: DataTypes.STRING
    },
    control: {
        type: DataTypes.STRING
    },
    seats: {
        type: DataTypes.STRING
    },
    ideal_use_case: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING
    },
    imagePublicId: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'vehicles',
    timestamps: false // You can enable Sequelize's default timestamps if needed
});

module.exports = Vehicle;

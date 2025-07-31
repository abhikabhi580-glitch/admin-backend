const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const WeaponType = sequelize.define('WeaponType', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'weaponType',
    timestamps: false // You can enable Sequelize's default timestamps if needed
});

module.exports = WeaponType;


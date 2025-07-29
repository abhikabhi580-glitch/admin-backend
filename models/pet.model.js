const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Pet = sequelize.define('Pet', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sub_title: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    ability: {
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
    tableName: 'pets',
    timestamps: false // You can change to true if you prefer Sequelize auto timestamps
});

module.exports = Pet;

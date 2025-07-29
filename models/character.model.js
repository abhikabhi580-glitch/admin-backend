const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Character = sequelize.define('Character', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sub_title: DataTypes.STRING,
    line: DataTypes.STRING,
    badge: DataTypes.STRING,
    birthday: DataTypes.STRING,
    gender: DataTypes.STRING,
    age: DataTypes.INTEGER,
    bio_description: DataTypes.STRING,
    description: DataTypes.STRING,
    ability: DataTypes.STRING,
    redeemed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    image: DataTypes.STRING,
    imagePublicId: DataTypes.STRING,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'characters',
    timestamps: false // You can enable this if you want Sequelize to manage createdAt/updatedAt
});

module.exports = Character;

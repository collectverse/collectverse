const { DataTypes } = require('sequelize');

const db = require('../db/conn')

const Collectibles = db.define('Collectibles', {
    name: {
        type: DataTypes.STRING,
        require: true
    },
    image: {
        type: DataTypes.STRING,
        require: true
    },
    path: {
        type: DataTypes.STRING,
        require: true
    },
    price: {
        type: DataTypes.DECIMAL,
        require: true
    },
    description: {
        type: DataTypes.STRING,
        require: true
    },
    rarity: {
        type: DataTypes.STRING,
        require: true
    }
});

module.exports = Collectibles
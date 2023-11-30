const { DataTypes } = require('sequelize');

const db = require('../db/conn')

const Items = db.define('Items', {
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
    name: {
        type: DataTypes.STRING,
        require: true
    },
    class: {
        type: DataTypes.STRING,
        require: true
    }
});

module.exports = Items
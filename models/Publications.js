const { DataTypes } = require('sequelize');

const db = require('../db/conn')

// Users
const Users = require('./Users')

const Publications = db.define('Publications', {
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        require: true
    },
    image: {
        type: DataTypes.STRING,
        require: true
    }
});

Publications.belongsTo(Users);
Users.hasMany(Publications);

module.exports = Publications
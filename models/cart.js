const { DataTypes } = require('sequelize');

const db = require('../db/conn')

// Users
const Users = require('./Users')

const Cart = db.define('Cart', {
    itemIds: {
        type: DataTypes.STRING,
        defaultValue: '[]',
        allowNull: false,
    }
});

Cart.belongsTo(Users);
Users.hasOne(Cart);

module.exports = Cart
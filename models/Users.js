const { DataTypes } = require('sequelize');

const db = require('../db/conn');

const Users = db.define('Users', {
    name: {
        type: DataTypes.STRING,
        require: true
    },
    email: {
        type: DataTypes.STRING,
        require: true
    },
    password: {
        type: DataTypes.STRING,
        require: true
    },
    perfil: {
        type: DataTypes.STRING,
        require: true,
        defaultValue: "https://www.tecmaran.com.br/res/imagens/blog/perfil_padrao.jpeg"
    }
});

module.exports = Users;

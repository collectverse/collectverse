const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('collectverse', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

try {
    sequelize.authenticate();
    console.log('Conectado com Banco de Dados');
} catch (error) {
    console.log(`Erro no Banco de Dados: ${error}`);
}

module.exports = sequelize;
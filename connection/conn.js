const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();


let conn = mysql.createPool({
    connectionLimit: process.env.connectionLimit,
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
})
console.log('Conexão estabelecida.');

module.exports = conn;
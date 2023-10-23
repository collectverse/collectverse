const mysql = require('mysql2');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '@ITB123456',
    database: 'collectverse'
})

module.exports = pool;
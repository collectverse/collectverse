const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'LocalInstance',
    password: 'Local@userdb',
    database: 'collectverse'
})

module.exports = pool;
const mysql = require('mysql2');

const password = require('./password');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: password
});


module.exports = pool.promise();
const mysql = require('mysql2');


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pos_data',
    
});

const promisePool = pool.promise();

module.exports = promisePool;

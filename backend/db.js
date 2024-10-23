// db.js
const mysql = require('mysql2');

// Create a MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
    console.log('db.query:', typeof db.query); // Log the type of db.query to debug
});

module.exports = db;

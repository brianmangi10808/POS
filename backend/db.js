// db.js
const mysql = require('mysql2');

// Create a MySQL connection
const db = mysql.createConnection({
   host: '102.130.118.213',
    user: 'render_user',
    password: 'password123',
    database: 'pos_data'
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
    console.log('db.query:', typeof db.query); // Log the type of db.query to debug
});

module.exports = db;

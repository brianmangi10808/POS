const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const port = 3000;
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const mysql = require('mysql');
const multer = require('multer');
const users = require("./routes/users");
const payment = require('./routes/payment');
const category= require('./routes/category');
const product= require('./routes/product');
const branches= require('./routes/branches');
const stock= require('./routes/stock');
const sales= require('./routes/sales');
const transactionRouter = require('./routes/transactionRouter');
const transfer= require('./routes/transfer');


//Middleware for parsing JSON data
app.use(express.json());


// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));



app.use('/api', users);
app.use('/api/', payment);
app.use('/api/', category);
app.use('/api/', product);
app.use('/api/', transfer);
app.use('/api/', branches);
app.use('/api/', stock);
app.use('/api/', sales);
app.use('/api', transactionRouter);


// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

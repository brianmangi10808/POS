const express = require('express');
const app = express();
const cors = require('cors');
const port = 3306;
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Middleware for parsing JSON data
app.use(express.json());
const multer = require('multer');

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory as buffer
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});


app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pos_data'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// List of predefined admin emails
const adminEmails = ['brian@gmail.com', 'faith@gmail.com', 'sharon@gmail.com'];

app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = adminEmails.includes(email) ? 'admin' : 'user';
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(query, [name, email, hashedPassword, role], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('User created:', { message: 'User created', role });
            res.status(201).json({ message: 'User created', role });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});



app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

app.get('/api/signup-data', (req, res) => {
    const query = `
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as count
        FROM users
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Create a new category
app.post('/api/categories', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    const query = 'INSERT INTO categories (name) VALUES (?)';
    db.query(query, [name], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Category created', id: results.insertId });
    });
});

// Update an existing category
app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    const query = 'UPDATE categories SET name = ? WHERE id = ?';
    db.query(query, [name, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category updated' });
    });
});

// Delete a category
app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM categories WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted' });
    });
});

// Get all categories
app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM categories';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

//create product
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, description, price, quantity, category_id } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!name || !price || !quantity || !category_id) {
        return res.status(400).json({ error: 'Name, price, quantity, and category_id are required' });
    }

    const query = 'INSERT INTO products (name, description, price, quantity, category_id, image) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, quantity, category_id, image], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Product created', id: results.insertId });
    });
});


//update product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, description, price, quantity, category_id } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!name || !price || !quantity || !category_id) {
        return res.status(400).json({ error: 'Name, price, quantity, and category_id are required' });
    }

    const query = 'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category_id = ?, image = ? WHERE id = ?';
    db.query(query, [name, description, price, quantity, category_id, image, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated' });
    });
});


//delete
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted' });
    });
});

//all products
app.get('/api/products', (req, res) => {
    const query = `SELECT products.*, categories.name as category_name 
                   FROM products 
                   JOIN categories ON products.category_id = categories.id`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Get products by category ID
app.get('/api/categories/:category_id/products', (req, res) => {
    const { category_id } = req.params;

    const query = `
        SELECT products.*, categories.name as category_name 
        FROM products 
        JOIN categories ON products.category_id = categories.id
        WHERE categories.id = ?`;
    
    db.query(query, [category_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No products found in this category' });
        }
        res.status(200).json(results);
    });
});



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const mysql = require('mysql');
const multer = require('multer');

// Middleware for parsing JSON data
app.use(express.json());

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// MySQL connection
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

// User Signup
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

// User Login
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

// Get Signup Data
app.get('/api/signup-data', (req, res) => {
    const query = `
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as count
        FROM users
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Create a New Category
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

// Update an Existing Category
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

// Delete a Category
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

// Get All Categories
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
// Create Product
app.post('/api/products', upload.single('image'), async (req, res) => {
    const { name, description, price, quantity, category_id, branchDetails } = req.body; // branchDetails included
    let image = null;
    let image_type = 'image/jpeg'; // Store the image type as JPEG

    if (req.file) {
        try {
            image = await sharp(req.file.buffer).jpeg().toBuffer(); // Convert to JPEG format
        } catch (error) {
            console.error('Error processing image:', error);
            return res.status(500).json({ error: 'Error processing image' });
        }
    }

    if (!name || !price || !quantity || !category_id || !Array.isArray(branchDetails)) {
        return res.status(400).json({ error: 'Name, price, quantity, category_id, and branchDetails are required' });
    }

    const query = 'INSERT INTO products (name, description, price, quantity, category_id, image, image_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, quantity, category_id, image, image_type], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        const productId = results.insertId;

        // Insert/Update branch-specific data
        branchDetails.forEach(({ branch_id, quantity, price }) => {
            db.query('SELECT * FROM branch_products WHERE branch_id = ? AND product_id = ?', [branch_id, productId], (err, results) => {
                if (err) {
                    console.error('Error checking branch product data:', err);
                    return res.status(500).json({ error: 'Error checking branch product data' });
                }

                if (results.length > 0) {
                    // Update existing record
                    db.query('UPDATE branch_products SET quantity = ?, price = ? WHERE branch_id = ? AND product_id = ?', [quantity, price, branch_id, productId], (err, result) => {
                        if (err) {
                            console.error('Error updating branch product data:', err);
                        }
                    });
                } else {
                    // Insert new record
                    db.query('INSERT INTO branch_products (branch_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [branch_id, productId, quantity, price], (err, result) => {
                        if (err) {
                            console.error('Error saving branch product data:', err);
                        }
                    });
                }
            });
        });

        res.status(201).json({ message: 'Product created', id: productId });
    });
});


//serving image
app.get('/api/products/:id/image', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT image FROM products WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { image } = results[0];
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.setHeader('Content-Type', 'image/jpeg'); // Serve as JPEG
        res.send(image);
    });
});




// Update Product
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

// Delete Product
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

// Get All Products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Get Products by Category
app.get('/api/categories/:category_id/products', (req, res) => {
    const { category_id } = req.params;

    const query = 'SELECT * FROM products WHERE category_id = ?';
    db.query(query, [category_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});



app.get('/branches', (req, res) => {
  db.query('SELECT * FROM branches', (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

app.get('/branches/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM branches WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result[0]);
  });
});

app.post('/branches', (req, res) => {
  const { name, location } = req.body;
  db.query('INSERT INTO branches (name, location) VALUES (?, ?)', [name, location], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ id: result.insertId, name, location });
  });
});

app.put('/branches/:id', (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  db.query('UPDATE branches SET name = ?, location = ? WHERE id = ?', [name, location, id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: 'Branch updated successfully' });
  });
});

app.delete('/branches/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM branches WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: 'Branch deleted successfully' });
  });
});


//branc_product
app.post('/branch-products', (req, res) => {
    const { branch_id, product_id, quantity, price } = req.body;
    // Check if the record already exists
    db.query('SELECT * FROM branch_products WHERE branch_id = ? AND product_id = ?', [branch_id, product_id], (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Error checking branch product data' });
        }

        if (results.length > 0) {
            // Update existing record
            db.query('UPDATE branch_products SET quantity = ?, price = ? WHERE branch_id = ? AND product_id = ?', [quantity, price, branch_id, product_id], (err, result) => {
                if (err) {
                    return res.status(500).send({ error: 'Error updating branch product data' });
                }
                res.status(200).send({ message: 'Branch product data updated successfully' });
            });
        } else {
            // Insert new record
            db.query('INSERT INTO branch_products (branch_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [branch_id, product_id, quantity, price], (err, result) => {
                if (err) {
                    return res.status(500).send({ error: 'Error saving branch product data' });
                }
                res.status(201).send({ message: 'Branch product data saved successfully' });
            });
        }
    });
});



// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

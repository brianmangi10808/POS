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

app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});


app.put('/api/users/:id/assign-branch', (req, res) => {
    const { id } = req.params;  // User ID
    const { branch_id } = req.body;  // Branch ID to assign

    if (!branch_id) {
        return res.status(400).json({ error: 'Branch ID is required' });
    }

    const query = 'UPDATE users SET branch_id = ? WHERE id = ?';
    db.query(query, [branch_id, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Branch assigned successfully' });
    });
});

app.get('/api/users-with-branches', (req, res) => {
    const query = `
        SELECT 
            u.id AS user_id, 
            u.name AS user_name, 
            u.email AS user_email, 
            u.role AS user_role, 
            b.id AS branch_id, 
            b.name AS branch_name, 
            b.location AS branch_location
        FROM 
            users u
        LEFT JOIN 
            branches b ON u.branch_id = b.id
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
    const { name, description, price, quantity, category_id } = req.body;
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

    if (!name || !price || !quantity || !category_id) {
        return res.status(400).json({ error: 'Name, price, quantity, and category_id are required' });
    }

    const query = 'INSERT INTO products (name, description, price, quantity, category_id, image, image_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, quantity, category_id, image, image_type], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Product created', id: results.insertId });
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



app.get('/api/branches', (req, res) => {
  db.query('SELECT * FROM branches', (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

app.get('/api/branches/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM branches WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result[0]);
  });
});

app.post('/api/branches', (req, res) => {
  const { name, location } = req.body;
  db.query('INSERT INTO branches (name, location) VALUES (?, ?)', [name, location], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ id: result.insertId, name, location });
  });
});

app.put('/api/branches/:id', (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  db.query('UPDATE branches SET name = ?, location = ? WHERE id = ?', [name, location, id], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: 'Branch updated successfully' });
  });
});

app.delete('/api/branches/:id', (req, res) => {
    const branchId = req.params.id;

    // Delete stock allocations for the branch
    const deleteStockAllocationsQuery = 'DELETE FROM branch_products WHERE branch_id = ?';

    // Delete the branch
    const deleteBranchQuery = 'DELETE FROM branches WHERE id = ?';

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: 'Transaction error' });

        db.query(deleteStockAllocationsQuery, [branchId], (err, results) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error deleting stock allocations:', err);
                    res.status(500).json({ error: 'Error deleting stock allocations' });
                });
            }

            db.query(deleteBranchQuery, [branchId], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error deleting branch:', err);
                        res.status(500).json({ error: 'Error deleting branch' });
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Transaction commit error:', err);
                            res.status(500).json({ error: 'Transaction commit error' });
                        });
                    }

                    res.status(200).json({ message: 'Branch and associated stock allocations deleted successfully' });
                });
            });
        });
    });
});


//inventory
app.post('/api/allocate-stock', async (req, res) => {
    const { product_id, category_id, allocations } = req.body;

    try {
        // Log request body for debugging
        console.log('Request body:', req.body);

        // Process each allocation
        for (const allocation of allocations) {
            const { branch_id, quantity } = allocation;

            if (!branch_id || !quantity) {
                throw new Error('Missing branch_id or quantity in allocations.');
            }

            await db.query(`
                INSERT INTO branch_products (branch_id, product_id, quantity, category_id)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);
            `, [branch_id, product_id, quantity, category_id]);
        }

        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error allocating stock:', error);
        res.status(500).send({ success: false, error: 'Internal Server Error' });
    }
});


app.get('/api/allocate-stock', (req, res) => {
    db.query('SELECT * FROM branch_products', (error, results) => {
        if (error) {
            console.error('Error fetching stock data:', error); // Log the error
            return res.status(500).send({ success: false, error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});


app.get('/api/allocated-stocks', (req, res) => {
    const query = `
        SELECT
            bp.branch_id,
            b.name AS branch_name,
            bp.product_id,
            p.name AS product_name,
            bp.quantity,
            bp.category_id,
            c.name AS category_name
        FROM
            branch_products bp
        JOIN
            branches b ON bp.branch_id = b.id
        JOIN
            products p ON bp.product_id = p.id
        JOIN
            categories c ON bp.category_id = c.id;
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching allocated stocks:', error);
            return res.status(500).send({ success: false, error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});




// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

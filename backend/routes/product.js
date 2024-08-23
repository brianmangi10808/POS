const express = require('express');
const router = express.Router();
const db = require('../db');
const sharp = require('sharp');

const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Create Product
router.post('/products', upload.single('image'), async (req, res) => {
    const { name, description, price, quantity, category_id, sku } = req.body;
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

    if (!name || !price || !quantity || !category_id || !sku) {
        return res.status(400).json({ error: 'Name, SKU, price, quantity, and category_id are required' });
    }

    const query = 'INSERT INTO products (name, description, price, quantity, category_id, sku, image, image_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, quantity, category_id, sku, image, image_type], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Product created', id: results.insertId });
    });
});

//serving image
router.get('/products/:id/image', (req, res) => {
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


//update

router.put('/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, description, price, quantity, category_id, sku } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!name || !price || !quantity || !category_id || !sku) {
        return res.status(400).json({ error: 'Name, SKU, price, quantity, and category_id are required' });
    }

    const query = 'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category_id = ?, sku = ?, image = ? WHERE id = ?';
    db.query(query, [name, description, price, quantity, category_id, sku, image, id], (err, results) => {
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
//geting product by id

router.get('/products/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(results[0]);
    });
});

// Delete Product
router.delete('/products/:id', (req, res) => {
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
router.get('/products', (req, res) => {
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
router.get('/categories/:category_id/products', (req, res) => {
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

router.post('/products', upload.single('image'), async (req, res) => {
    const { name, description, price, quantity, category_id, sku } = req.body;
    
    // Check if SKU already exists
    const skuCheckQuery = 'SELECT COUNT(*) AS count FROM products WHERE sku = ?';
    db.query(skuCheckQuery, [sku], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results[0].count > 0) {
            return res.status(400).json({ error: 'SKU already exists' });
        }

        // Proceed with product creation
        let image = null;
        let image_type = 'image/jpeg'; // Store the image type as JPEG

        if (req.file) {
            try {
                image =  sharp(req.file.buffer).jpeg().toBuffer(); // Convert to JPEG format
            } catch (error) {
                console.error('Error processing image:', error);
                return res.status(500).json({ error: 'Error processing image' });
            }
        }

        const query = 'INSERT INTO products (name, description, price, quantity, category_id, sku, image, image_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, description, price, quantity, category_id, sku, image, image_type], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Product created', id: results.insertId });
        });
    });
});


module.exports = router;
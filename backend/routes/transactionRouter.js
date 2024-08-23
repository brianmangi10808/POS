const express = require('express');
const router = express.Router();
const async = require('async');
const db = require('../db');

// Endpoint to update stock
// Endpoint to update stock
router.post('/update-stock', (req, res) => {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
    }
    if (totalAmount === undefined) {
        return res.status(400).json({ error: 'Total amount is required' });
    }

    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error('Transaction start error:', transactionErr);
            return res.status(500).json({ error: 'Database transaction error' });
        }

        const processItem = (item, callback) => {
            const { productId, sku, quantity } = item;

            // Log the item to ensure it's coming through correctly
            console.log('Processing item:', item);

            if (!productId || !sku || !quantity) {
                console.error('Missing productId, SKU, or quantity in item:', item);
                return callback(new Error('Product ID, SKU, and quantity are required'));
            }

            const query = 'SELECT quantity FROM products WHERE id = ? AND sku = ?';
            db.query(query, [productId, sku], (err, results) => {
                if (err) {
                    return callback(err);
                }
                if (results.length === 0) {
                    return callback(new Error(`Product with ID ${productId} and SKU ${sku} not found`));
                }

                const availableQuantity = results[0].quantity;

                if (availableQuantity < quantity) {
                    return callback(new Error(`Insufficient quantity available for SKU ${sku}`));
                }

                const newQuantity = availableQuantity - quantity;
                const updateQuery = 'UPDATE products SET quantity = ? WHERE id = ? AND sku = ?';
                db.query(updateQuery, [newQuantity, productId, sku], (updateErr) => {
                    if (updateErr) {
                        return callback(updateErr);
                    }

                    const transactionQuery = 'INSERT INTO transactions (product_id, sku, quantity, transaction_date, total_amount) VALUES (?, ?, ?, NOW(), ?)';
                    db.query(transactionQuery, [productId, sku, quantity, totalAmount], (transactionErr) => {
                        if (transactionErr) {
                            return callback(transactionErr);
                        }
                        callback(null, newQuantity);
                    });
                });
            });
        };

        async.eachSeries(items, processItem, (err) => {
            if (err) {
                console.error('Error processing items:', err);
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }

            db.commit((commitErr) => {
                if (commitErr) {
                    console.error('Transaction commit error:', commitErr);
                    return db.rollback(() => res.status(500).json({ error: 'Transaction commit error' }));
                }

                res.status(200).json({ message: 'Stock updated and transactions logged successfully' });
            });
        });
    });
});

// Endpoint to record a transaction
router.post('/transactions', (req, res) => {
    const { customerName, items, totalAmount, paymentMethod } = req.body;

    if (!customerName || !items || !totalAmount || !paymentMethod) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!Array.isArray(items) || items.some(item => !item.sku || !item.quantity)) {
        return res.status(400).json({ error: 'Each item must have a SKU and quantity' });
    }

    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error('Transaction start error:', transactionErr);
            return res.status(500).json({ error: 'Failed to start transaction' });
        }

        const insertTransactionQuery = `
            INSERT INTO transactions (sku, quantity, transaction_date, customer_name, total_amount, payment_method) 
            VALUES (?, ?, NOW(), ?, ?, ?)
        `;

        const transactionPromises = items.map(item => {
            return new Promise((resolve, reject) => {
                db.query(insertTransactionQuery, [item.sku, item.quantity, customerName, totalAmount, paymentMethod], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });

        Promise.all(transactionPromises)
            .then(() => {
                db.commit((commitErr) => {
                    if (commitErr) {
                        console.error('Transaction commit error:', commitErr);
                        return db.rollback(() => {
                            return res.status(500).json({ error: 'Failed to commit transaction' });
                        });
                    }
                    res.status(201).json({ message: 'Transactions recorded successfully' });
                });
            })
            .catch(insertErr => {
                console.error('Transaction insert error:', insertErr);
                db.rollback(() => {
                    return res.status(500).json({ error: 'Failed to record transactions' });
                });
            });
    });
});

module.exports = router;

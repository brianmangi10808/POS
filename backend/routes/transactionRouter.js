const express = require('express');
const router = express.Router();
const async = require('async');
const db = require('../db');

// Endpoint to update stock
router.post('/update-stock', (req, res) => {
    const { items, totalAmount, branchId, customerName, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array is required' });
    }
    if (totalAmount === undefined) {
        return res.status(400).json({ error: 'Total amount is required' });
    }
    if (!branchId) {
        return res.status(400).json({ error: 'Branch ID is required' });
    }
    if (!paymentMethod) {
        return res.status(400).json({ error: 'Payment method is required' });
    }

    let remainingQuantities = [];

    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error('Transaction start error:', transactionErr);
            return res.status(500).json({ error: 'Database transaction error' });
        }

        const processItem = (item, callback) => {
            const { productId, sku, quantity } = item;

            if (!productId || !sku || !quantity) {
                console.error('Missing productId, sku, or quantity in item:', item);
                return callback(new Error('Product ID, SKU, and quantity are required'));
            }

            // Query to check stock for the specific branch and product
            const query = 'SELECT quantity FROM branch_products WHERE product_id = ? AND branch_id = ?';
            db.query(query, [productId, branchId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                if (results.length === 0) {
                    return callback(new Error(`Product with ID ${productId} not found in branch ${branchId}`));
                }

                const availableQuantity = results[0].quantity;

                if (availableQuantity < quantity) {
                    return callback(new Error(`Insufficient quantity available for product ID ${productId} in branch ${branchId}`));
                }

                const newQuantity = availableQuantity - quantity;

                // Update the quantity in branch_products
                const updateQuery = 'UPDATE branch_products SET quantity = ? WHERE product_id = ? AND branch_id = ?';
                db.query(updateQuery, [newQuantity, productId, branchId], (updateErr) => {
                    if (updateErr) {
                        return callback(updateErr);
                    }

                    // Log the transaction for this branch
                    const logTransactionQuery = `
                        INSERT INTO transactions 
                        (product_id, sku, quantity, transaction_date, total_amount, branch_id, customer_name, payment_method)
                        VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)
                    `;
                    db.query(logTransactionQuery, [
                        productId, 
                        sku, 
                        quantity, 
                        totalAmount, 
                        branchId, 
                        customerName || null,  // Set to NULL if customerName is not provided
                        paymentMethod
                    ], (logErr) => {
                        if (logErr) {
                            return callback(logErr);
                        }

                        // Add the updated quantity to the array for response
                        remainingQuantities.push({
                            productId,
                            remainingQuantity: newQuantity
                        });

                        // Proceed to the next item
                        callback(null);
                    });
                });
            });
        };

        // Process each item in the cart
        async.eachSeries(items, processItem, (err) => {
            if (err) {
                console.error('Error processing items:', err);
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }

            // Commit the transaction after processing all items
            db.commit((commitErr) => {
                if (commitErr) {
                    console.error('Transaction commit error:', commitErr);
                    return db.rollback(() => res.status(500).json({ error: 'Transaction commit error' }));
                }

                // Return the updated stock quantities for each product
                res.status(200).json({
                    message: 'Stock updated and transactions logged successfully for branch',
                    remainingQuantities: remainingQuantities
                });
            });
        });
    });
});

// Endpoint to record a transaction
router.post('/transactions', (req, res) => {
    const { customerName, items, totalAmount, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !totalAmount || !paymentMethod) {
        return res.status(400).json({ error: 'Items, total amount, and payment method are required' });
    }

    if (!Array.isArray(items) || items.some(item => !item.sku || !item.quantity)) {
        return res.status(400).json({ error: 'Each item must have a SKU and quantity' });
    }

    // Use 'Anonymous' if customerName is not provided
    const validatedCustomerName = customerName || 'Anonymous';

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
                db.query(insertTransactionQuery, [item.sku, item.quantity, validatedCustomerName, totalAmount, paymentMethod], (err, results) => {
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

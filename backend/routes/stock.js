const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/allocate-stock', async (req, res) => {
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


router.get('/allocate-stock', (req, res) => {
    db.query('SELECT * FROM branch_products', (error, results) => {
        if (error) {
            console.error('Error fetching stock data:', error); // Log the error
            return res.status(500).send({ success: false, error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});


router.get('/allocated-stocks', (req, res) => {
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





module.exports = router;
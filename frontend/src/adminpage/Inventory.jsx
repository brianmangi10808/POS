import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Inventory({ productId, branchId }) {
    const [inventory, setInventory] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/inventory', {
                    params: { product_id: productId, branch_id: branchId }
                });
                setInventory(response.data);
            } catch (error) {
                setError('Failed to fetch inventory.');
            }
        };

        fetchInventory();
    }, [productId, branchId]);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Inventory</h2>
            <ul>
                {inventory.map(item => (
                    <li key={item.id}>Quantity: {item.quantity}</li>
                ))}
            </ul>
        </div>
    );
}

export default Inventory;

// src/ProductManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL of your API
const API_URL = 'http://localhost:3000/api/products';
const CATEGORY_API_URL = 'http://localhost:3000/api/categories';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category_id: '',
        image: null
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(API_URL);
            setProducts(response.data);
        } catch (err) {
            setError('Error fetching products');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(CATEGORY_API_URL);
            setCategories(response.data);
        } catch (err) {
            setError('Error fetching categories');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('quantity', product.quantity);
        formData.append('category_id', product.category_id);
        if (product.image) {
            formData.append('image', product.image);
        }

        try {
            if (editingProductId) {
                await axios.put(`${API_URL}/${editingProductId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setEditingProductId(null);
            } else {
                await axios.post(API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchProducts();
            setProduct({
                name: '',
                description: '',
                price: '',
                quantity: '',
                category_id: '',
                image: null
            });
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error saving product');
        }
    };

    const handleEdit = (product) => {
        setProduct({
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            category_id: product.category_id,
            image: null
        });
        setEditingProductId(product.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchProducts();
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error deleting product');
        }
    };

    return (
        <div>
            <h1>Product Management</h1>
            <form onSubmit={handleCreateOrUpdate}>
                <div>
                    <label>Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <input
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Price</label>
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Category</label>
                    <select
                        name="category_id"
                        value={product.category_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Image</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">
                    {editingProductId ? 'Update Product' : 'Create Product'}
                </button>
            </form>

            <h2>Products</h2>
            {products.length === 0 ? (
                <p>No products found</p>
            ) : (
                <ul>
                    {products.map((prod, index) => (
                        <li key={prod.id}>
                            {index + 1}. {prod.name} (ID: {prod.id}, Category: {prod.category_name})
                            <button onClick={() => handleEdit(prod)}>Edit</button>
                            <button onClick={() => handleDelete(prod.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Product;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Product.css"
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';


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
        <div class="product-management-container">
        <h1 class="page-title">Product Management</h1>
        <form class="form-product" onSubmit={handleCreateOrUpdate}>
            <div class="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div class="form-group">
                <label htmlFor="description">Description</label>
                <input
                    id="description"
                    type="text"
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                />
            </div>
            <div class="form-group">
                <label htmlFor="price">Price</label>
                <input
                    id="price"
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div class="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div class="form-group">
                <label htmlFor="category_id">Category</label>
                <select
                    id="category_id"
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
            <div class="form-group">
                <label htmlFor="image">Image</label>
                <input
                    id="image"
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                />
            </div>
            {error && <p class="error-message">{error}</p>}
            <button class="btn-product-submit" type="submit">
                {editingProductId ? 'Update Product' : 'Create Product'}
            </button>
        </form>
    
        <h2 class="section-title">Products</h2>
        <div class="category-product-align">
            <h3 class="category-title">Category</h3>
        </div>
        {products.length === 0 ? (
            <p class="no-products">No products found</p>
        ) : (
            <ul class="product-list">
                {products.map((prod, index) => (
                    <li class="product-item" key={prod.id}>
                        <div class="product-details">
                            <span class="product-number">{index + 1}. </span>
                            <span class="product-name">{prod.name}</span>
                            <span class="category-name">{prod.category_name}</span>
                        </div>
                        <div class="product-buttons">
                            <button class="btn-edit" onClick={() => handleEdit(prod)}>
                                <EditIcon boxSize={17} />
                                <span class="btn-text">Edit</span>
                            </button>
                            <button class="btn-delete" onClick={() => handleDelete(prod.id)}>
                                <DeleteIcon boxSize={17} />
                                <span class="btn-text">Delete</span>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>
    
    );
};

export default Product;

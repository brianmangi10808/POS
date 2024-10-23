import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Product.css";
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

// URL of your API
const API_URL = 'https://pos-backend-16dc.onrender.com/api/products';
const CATEGORY_API_URL = 'https://pos-backend-16dc.onrender.com/api/categories';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category_id: '',
        barcode: '',
        image: null
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [error, setError] = useState('');
    const [barcode, setBarcode] = useState('');

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

  

    const generateSKU = () => {
        if (!product.name) return '';
    
        const namePart = product.name.split(' ').map(word => word[0].toUpperCase()).join('');
        const timestamp = Date.now();
    
        return `${namePart}-${timestamp}`;
    };
    
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');
    
        const sku = generateSKU();
    
        if (!sku) {
            setError('Error generating SKU. Please ensure all fields are filled out correctly.');
            return;
        }
    
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('quantity', product.quantity);
        formData.append('category_id', product.category_id);
        formData.append('sku', sku);
    
        if (product.image) {
            formData.append('image', product.image);
        }
    
        try {
            console.log('API_URL:', API_URL);
            // Log formData contents
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
    
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
            fetchProducts(); // Refresh products
            setProduct({
                name: '',
                description: '',
                price: '',
                quantity: '',
                category_id: '',
                image: null
            });
        } catch (err) {
            console.error('Axios error:', err);
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
            // barcode: product.barcode,
            image: null
        });
        setEditingProductId(product.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchProducts(); // Refresh products
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error deleting product');
        }
    };

    return (
        <div className="product-management-container">
            <h1 className="page-title">Product Management</h1>
            <form className="form-product" onSubmit={handleCreateOrUpdate}>
                <div className="form-group">
                    <label htmlFor="barcode">Barcode</label>
                    <input
                        id="barcode"
                        type="text"
                        name="barcode"
                        value={product.barcode}
                        onChange={handleInputChange}
                        placeholder="Enter barcode"
                        required
                    />
                </div>
                <div className="form-group">
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
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        id="description"
                        type="text"
                        name="description"
                        value={product.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <input
                        id="image"
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button
                    className="btn-product-submit"
                    type="submit"
                    disabled={!product.name || !product.category_id || categories.length === 0}
                >
                    {editingProductId ? 'Update Product' : 'Create Product'}
                </button>
            </form>

            <h2 className="section-title">Products</h2>
            <div className="category-product-align">
                <h3 className="category-title">Category</h3>
            </div>
            {products.length === 0 ? (
                <p className="no-products">No products found</p>
            ) : (
                <ul className="product-list">
                    {products.map((prod, index) => (
                        <li className="product-item" key={prod.id}>
                            <div className="product-details">
                                <span className="product-number">{index + 1}. </span>
                                <span className="product-name">{prod.name}</span>
                                <span className="product-sku">SKU: {prod.sku}</span>
                                <span className="product-quantity">Q: {prod.quantity}</span>
                                <span className="category-name">{prod.category_name}</span>
                                <span className="product-barcode">Barcode: {prod.barcode}</span>
                            </div>
                            <div className="product-buttons">
                                <button className="btn-edit" onClick={() => handleEdit(prod)}>
                                    <EditIcon boxSize={17} />
                                    <span className="btn-text">Edit</span>
                                </button>
                                <button className="btn-delete" onClick={() => handleDelete(prod.id)}>
                                    <DeleteIcon boxSize={17} />
                                    <span className="btn-text">Delete</span>
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import './Order.css';

// URLs of your APIs
const CATEGORY_API_URL = 'http://localhost:3000/api/categories';
const PRODUCT_API_URL = 'http://localhost:3000/api/products';

const Orders = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [product, setProduct] = useState({
        name: '',
        description: '',
        buying_price:'',
        selling_price:'',
        quantity: '',
        category_id: '',
        image: null
    });
    const [taxRate, setTaxRate] = useState('');

    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [error, setError] = useState('');
    const [view, setView] = useState('categories'); 
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(CATEGORY_API_URL);
            setCategories(response.data);
        } catch (err) {
            setError('Error fetching categories');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(PRODUCT_API_URL);
            setProducts(response.data);
        } catch (err) {
            setError('Error fetching products');
        }
    };

    const handleCategoryInputChange = (e) => {
        setName(e.target.value);
    };

    const handleProductInputChange = (e) => {
        const { name, value, files } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleCategoryCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');
    
        try {
            const upperCaseName = name.toUpperCase();
    
            const categoryData = {
                name: upperCaseName,
                tax_rate: taxRate // Include the selected tax rate
            };
    
            if (editingCategoryId) {
                await axios.put(`${CATEGORY_API_URL}/${editingCategoryId}`, categoryData);
            } else {
                await axios.post(CATEGORY_API_URL, categoryData);
            }
            fetchCategories();
            setName('');
            setTaxRate(''); // Reset tax rate after submission
            setEditingCategoryId(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error saving category');
        }
    };
    

    const handleProductCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage(''); // Clear previous success message
    
        const sku = generateSKU();
    
        if (!sku) {
            setError('Error generating SKU. Please ensure all fields are filled out correctly.');
            return;
        }
    
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('buying_price', product.buying_price);
        formData.append('selling_price', product.selling_price);
        formData.append('quantity', product.quantity);
        formData.append('category_id', product.category_id);
        formData.append('sku', sku);
    
        if (product.image) {
            formData.append('image', product.image);
        }
    
        try {
            console.log('PRODUCT_API_URL:', PRODUCT_API_URL);
            // Log formData contents
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
    
            if (editingProductId) {
                // Update existing product
                await axios.put(`${PRODUCT_API_URL}/${editingProductId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccessMessage('Product updated successfully!');
                setEditingProductId(null);
            } else {
                // Create new product
                await axios.post(PRODUCT_API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setSuccessMessage('Product created, added to Main Branch, and synced with eTIMS successfully!');
            }
    
            fetchProducts(); // Refresh products list
    
            // Clear the product form
            setProduct({
                name: '',
                description: '',
                buying_price:'',
                selling_price:'',
                quantity: '',
                category_id: '',
                image: null
            });
    
        } catch (err) {
            console.error('Error during Axios request:', err); // Log error details
            setError(err.response ? err.response.data.error : 'Error saving product');
        }
    };
    
    
    const handleEditCategory = (category) => {
        setName(category.name);
        setTaxRate(category.tax_rate); // Set the tax rate from the selected category
        setEditingCategoryId(category.id);
    };
    

    const handleEditProduct = (product) => {
        setProduct({
            name: product.name,
            description: product.description,
            buying_price: product.buying_price,
            selling_price: product. selling_price,
            quantity: product.quantity,
            category_id: product.category_id,
            image: null
        });
        setEditingProductId(product.id);
    };

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`${CATEGORY_API_URL}/${id}`);
            fetchCategories();
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error deleting category');
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`${PRODUCT_API_URL}/${id}`);
            fetchProducts();
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error deleting product');
        }
    };

    const generateSKU = () => {
        if (!product.name) return '';

        const namePart = product.name.split(' ').map(word => word[0].toUpperCase()).join('');
        const timestamp = Date.now();

        return `${namePart}-${timestamp}`;
    };

    return (
        <div className="management-container">
            <div className="button-group">
                <button onClick={() => setView('categories')} className={view === 'categories' ? 'active' : ''}>
                    Manage Categories
                </button>
                <button onClick={() => setView('products')} className={view === 'products' ? 'active' : ''}>
                    Manage Products
                </button>
            </div>

            {view === 'categories' && (
                <div className="category-section">
                    <h1 className="page-title">Category Management</h1>
                    <form className="form-category" onSubmit={handleCategoryCreateOrUpdate}>
                        <div className="form-group">
                            <label htmlFor="name">Category Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={handleCategoryInputChange}
                                required
                            />

                        </div>
                        <div className="form-group">
        <label htmlFor="tax_rate">Tax Rate</label>
        <select
            id="tax_rate"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            required
        >
            <option value="">Select Tax Rate</option>
            <option value="0.16">16%</option>
            <option value="0.08">8%</option>
            <option value="0.00">Exempted / 0%</option>
        </select>
    </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="btn-submit">
                            {editingCategoryId ? 'Update Category' : 'Create Category'}
                        </button>
                    </form>

                    <h2 className="section-title">Categories</h2>
                    {categories.length === 0 ? (
                        <p className="no-items">No categories found</p>
                    ) : (
                        <ul className="item-list">
                            {categories.map(category => (
                                <li className="item" key={category.id}>
                                    <div className="item-details">
                                        <span className="item-name">{category.name}</span>
                                        <span className="item-tax-rate">{category.tax_rate * 100}%</span>
                                    </div>
                                    <div className="item-buttons">
                                        <button onClick={() => handleEditCategory(category)}>
                                            <EditIcon boxSize={17} />
                                            <span className="btn-text">Edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category.id)}>
                                            <DeleteIcon boxSize={17} />
                                            <span className="btn-text">Delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {view === 'products' && (
                <div className="product-section">
                    <h1 className="page-title">Product Management</h1>
                    <form className="form-product" onSubmit={handleProductCreateOrUpdate}>
                        <div className="left-right-product">
                            <div className="left-product">
                        <div className="form-group">
                            <label htmlFor="productName">Product Name</label>
                            <input
                                id="productName"
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={handleProductInputChange}
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
                                onChange={handleProductInputChange}
                            />
                        </div>
                        <div className="form-group">
                            
                            <label htmlFor="buying_price">buying price</label>
                            <input
                                id="buying_price"
                                type="number"
                                name="buying_price"
                                value={product.buying_price}
                                onChange={handleProductInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            
                            <label htmlFor="selling_price">selling price</label>
                            <input
                                id="selling_price"
                                type="number"
                                name="selling_price"
                                value={product.selling_price}
                                onChange={handleProductInputChange}
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
                                onChange={handleProductInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category_id">Category</label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={product.category_id}
                                onChange={handleProductInputChange}
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
                        </div>
                        <div className="right-product">
                        <div className="form-group">
                            <label htmlFor="image">IMAGE</label>
                            <input
                                id="image"
                                type="file"
                                name="image"
                                onChange={handleProductInputChange}
                            />
                        </div>
                        </div>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button
                            className="btn-submit"
                            type="submit"
                            disabled={!product.name || !product.category_id || categories.length === 0}
                        >
                            {editingProductId ? 'Update Product' : 'Create Product'}
                        </button>
                         {/* Display success message */}
      {successMessage && <div className="success-message">{successMessage}</div>}

                        
                    </form>

                    <h2 className="section-title">Products</h2>
                    {products.length === 0 ? (
                        <p className="no-items">No products found</p>
                    ) : (
                        <ul className="item-list">
                            {products.map((prod, index) => (
                                <li className="item" key={prod.id}>
                                    <div className="item-details">
                                        <span className="item-number">{index + 1}. </span>
                                        <span className="item-name">{prod.name}</span>
                                        <span className="item-sku">SKU: {prod.sku}</span>
                                        <span className="item-quantity">Q: {prod.quantity}</span>
                                        <span className="item-category">{prod.category_name}</span>
                                    </div>
                                    <div className="item-buttons">
                                        <button onClick={() => handleEditProduct(prod)}>
                                            <EditIcon boxSize={17} />
                                            <span className="btn-text">Edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteProduct(prod.id)}>
                                            <DeleteIcon boxSize={17} />
                                            <span className="btn-text">Delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};



export default Orders
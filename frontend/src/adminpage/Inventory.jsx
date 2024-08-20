import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stock.css'

// URLs of your APIs
const CATEGORIES_API_URL = 'http://localhost:3000/api/categories';
const PRODUCTS_API_URL = 'http://localhost:3000/api/products';
const BRANCHES_API_URL = 'http://localhost:3000/api/branches';
const STOCKS_API_URL = 'http://localhost:3000/api/allocate-stock';
const ALLOCATED_STOCKS_API_URL = 'http://localhost:3000/api/allocated-stocks';

const Inventory = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [stockData, setStockData] = useState({});
    const [allocatedStocks, setAllocatedStocks] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const filtered = products.filter(product => product.category_id === parseInt(selectedCategory));
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    }, [selectedCategory, products]);
    

    useEffect(() => {
        if (selectedBranch) {
            fetchAllocatedStocks(selectedBranch);
        }
    }, [selectedBranch]);

    const fetchData = async () => {
        try {
            const [categoriesResponse, productsResponse, branchesResponse, stocksResponse] = await Promise.all([
                axios.get(CATEGORIES_API_URL),
                axios.get(PRODUCTS_API_URL),
                axios.get(BRANCHES_API_URL),
                axios.get(STOCKS_API_URL)
            ]);

            if (Array.isArray(categoriesResponse.data)) {
                setCategories(categoriesResponse.data);
            } else {
                throw new Error('Invalid categories response format');
            }

            if (Array.isArray(productsResponse.data)) {
                setProducts(productsResponse.data);
            } else {
                throw new Error('Invalid products response format');
            }

            if (Array.isArray(branchesResponse.data)) {
                setBranches(branchesResponse.data);
                if (branchesResponse.data.length > 0) {
                    setSelectedBranch(branchesResponse.data[0].id); // Set initial branch selection
                }
            } else {
                throw new Error('Invalid branches response format');
            }

            if (typeof stocksResponse.data === 'object') {
                setStockData(stocksResponse.data);
            } else {
                throw new Error('Invalid stock data response format');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching data');
        }
    };

    const fetchAllocatedStocks = async (branchId) => {
        try {
            console.log(`Fetching allocated stocks for branch ID: ${branchId}`); // Debugging line
            const response = await axios.get(`${ALLOCATED_STOCKS_API_URL}?branch_id=${branchId}`);
            console.log('Allocated stocks response:', response.data); // Debugging line
            setAllocatedStocks(response.data);
        } catch (err) {
            console.error('Error fetching allocated stocks:', err);
            setError('Error fetching allocated stocks');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const allocations = branches.map(branch => ({
                branch_id: branch.id,
                quantity: stockData[branch.id] || 0
            }));

            if (allocations.some(allocation => !allocation.branch_id)) {
                throw new Error('One or more branch IDs are missing.');
            }

            await axios.post(STOCKS_API_URL, {
                product_id: selectedProduct,
                category_id: selectedCategory,
                allocations,
            });

            fetchData(); // Refresh data
            setSelectedCategory(''); // Clear selection
            setSelectedProduct(''); // Clear selection
            setStockData({}); // Clear stock data
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error allocating stock');
        }
    };

    return (
        <div className="inventory-container">
    <h1 className="page-title">Inventory Management</h1>
    <form className="inventory-form" onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
            >
                <option value="">Select a category</option>
                {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
        </div>

        <div className="form-group">
            <label htmlFor="product">Product:</label>
            <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
            >
                <option value="">Select a product</option>
                {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                        {product.name}
                    </option>
                ))}
            </select>
        </div>

        <div className="form-group">
            <h3 className="section-subtitle">Branch Quantities:</h3>
            {Array.isArray(branches) && branches.map((branch) => (
                <div className="branch-quantity" key={branch.id}>
                    <label htmlFor={`branch-${branch.id}`}>{branch.name}:</label>
                    <input
                        id={`branch-${branch.id}`}
                        type="number"
                        value={stockData[branch.id] || ''}
                        onChange={(e) => setStockData({
                            ...stockData,
                            [branch.id]: e.target.value,
                        })}
                        placeholder="Enter quantity"
                        min="0"
                    />
                </div>
            ))}
        </div>

        <button type="submit" className="submit-button">Allocate Stock</button>
    </form>
    {error && <p className="error-message">{error}</p>}
    
    <div className="allocated-stocks">
        <h1 className="section-title">Allocated Stocks</h1>
        <div className="form-group">
            <label htmlFor="branch-select">Select Branch:</label>
            <select
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                required
            >
                {Array.isArray(branches) && branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </select>
        </div>
        <table className="stocks-table">
            <thead>
                <tr>
                    <th>Branch</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                {allocatedStocks.map(stock => (
                    <tr key={`${stock.branch_id}-${stock.product_id}`}>
                        <td>{stock.branch_name}</td>
                        <td>{stock.product_name}</td>
                        <td>{stock.quantity}</td>
                        <td>{stock.category_name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>

    
    );
};

export default Inventory;

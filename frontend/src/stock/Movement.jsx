import React, { useState, useEffect } from 'react';
import { ArrowBackIcon } from '@chakra-ui/icons';

import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './Movement.css';

function Movement() {
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSourceBranch, setSelectedSourceBranch] = useState('');
  const [selectedDestinationBranch, setSelectedDestinationBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transferQuantity, setTransferQuantity] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchesResponse = await axios.get('http://localhost:3000/api/branches');
        const categoriesResponse = await axios.get('http://localhost:3000/api/categories');
        setBranches(branchesResponse.data);
        setCategories(categoriesResponse.data);

        const mainBranch = branchesResponse.data.find(branch => branch.protected === 1);
        if (mainBranch) {
          setSelectedSourceBranch(mainBranch.id);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleProductModal = () => {
    setShowProductModal(!showProductModal);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSearchResults([]); // Clear previous search results
    setSearchTerm(''); // Clear search term
  };

  const handleSearchChange = async (e) => {
    setSearchTerm(e.target.value);

    if (e.target.value.length > 2 && selectedCategory) {
      try {
        const response = await axios.get(`http://localhost:3000/api/prodcat`, {
          params: {
            productName: e.target.value,
            categoryId: selectedCategory
          }
        });
        if (response.data) {
          setSearchResults(response.data);  // Store the results to display them
        } else {
          setSearchResults([]);
          console.log('No products found');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to fetch product details. Please check the console for more details.');
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setTransferQuantity('');
    setSearchResults([]);
    setShowProductModal(false);
  };

  const handleTransfer = async () => {
    if (!selectedProduct || !transferQuantity || !selectedDestinationBranch) {
      alert('Please select a product, enter a quantity, and choose a destination branch.');
      return;
    }
  
    try {
      const transferData = {
        productId: selectedProduct.productId,
        targetBranchId: selectedDestinationBranch,
        transferQuantity,
        transferDate
      };
  
      // Transfer the product
      await axios.post('http://localhost:3000/api/products/transfer', transferData);
      alert('Product transferred successfully!');
  
      // Log the details after successful transfer
      const detailData = {
        productId: selectedProduct.productId,
        branchId: selectedDestinationBranch,
        detailType: 'Transfer', // Example: the type of detail being logged
        detailDescription: ` ${transferQuantity} .`,
        detailDate: transferDate
      };
  
      await axios.post('http://localhost:3000/api/products/details', detailData);
      alert('Details logged successfully!');
  
      resetForm();
    } catch (error) {
      alert('Transfer or logging failed: ' + error.message);
    }
  };
  
  const resetForm = () => {
    setSelectedDestinationBranch('');
    setSelectedCategory('');
    setSelectedProduct(null);
    setTransferQuantity('');
    setTransferDate(new Date().toISOString().split('T')[0]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Filter branches to show only the main branch in the source dropdown
  const sourceBranchOptions = branches
    .filter(branch => branch.protected === 1) // Only main branch
    .map(branch => (
      <option key={branch.id} value={branch.id}>
        {branch.name}
      </option>
    ));

  // Filter branches to exclude the main branch for the destination dropdown
  const destinationBranchOptions = branches
    .filter(branch => branch.protected === 0) // Exclude main branch
    .map(branch => (
      <option key={branch.id} value={branch.id}>
        {branch.name}
      </option>
    ));

  return (
    <div className='movement-container'>
      <div className="arrow-back">
        <NavLink to='/admin/inventory/transfers'>
          <ArrowBackIcon boxSize={20} />
          <span>New Transfer</span>
        </NavLink>
      </div>

      <div className="transfer-header">
        <p>Add products to this transfer to keep track of outbound and inbound inventory.</p>
      </div>

      <div className="transfer-form">
        <div className="transfer-section">
          <h3>Transfer Details</h3>
          <p>Adding details to this transfer helps staff stay on top of transfers and easily identify outgoing and incoming items.</p>

          {error && <div className="error-message">{error}</div>}

          <div className="transfer-inputs">
            <div className="input-group">
              <label>Source Outlet</label>
              <select
                value={selectedSourceBranch}
                onChange={e => setSelectedSourceBranch(e.target.value)}
                disabled
              >
                {sourceBranchOptions}
              </select>
            </div>

            <div className="input-group">
              <label>Destination Outlet</label>
              <select
                value={selectedDestinationBranch}
                onChange={e => setSelectedDestinationBranch(e.target.value)}
              >
                <option value="">Choose an outlet</option>
                {destinationBranchOptions}
              </select>
            </div>

            <div className="input-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            

            <div className="input-group">
              <label>Choose a Date</label>
              <input
                type="date"
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="product-section">
          <h3>Products</h3>
          <p>Choose products to add to this transfer, or choose a CSV file of products to import.</p>

          <div className="product-actions">
            <button className="choose-products" onClick={toggleProductModal}>Choose Products</button>
          </div>

          {selectedProduct && (
            <div className="product-details">
              <h4>{selectedProduct.name}</h4>
              <p>Price: ${selectedProduct.price}</p>
              <p>Quantity in Main Branch: {selectedProduct.quantityInMainBranch}</p>
              <div className="input-group">
                <label>Quantity to Transfer:</label>
                <input
                  type="number"
                  value={transferQuantity}
                  onChange={e => setTransferQuantity(e.target.value)}
                  min="1"
                  max={selectedProduct.quantityInMainBranch}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="transfer-actions">
        <button className="cancel" onClick={() => resetForm()}>Cancel</button>
        <button className="save" onClick={handleTransfer}>Save Transfer</button>
      </div>

      {showProductModal && (
        <div className="product-modal">
          <div className="product-modal-content">
            <h2>Add Products to this delivery</h2>
            <input
              type="text"
              placeholder="Search or scan to add a product"
              className="product-search"
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={!selectedCategory}
            />
            <ul className="product-search-results">
              {searchResults.map((product, index) => (
                <li key={index} onClick={() => handleProductSelect(product)}>
                  {product.name}
                </li>
              ))}
            </ul>
            <button className="close-modal" onClick={toggleProductModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Movement;

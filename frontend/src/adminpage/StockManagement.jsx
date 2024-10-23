import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Category.css'

const StockManagement = () => {
  const [stockThreshold, setStockThreshold] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const [approval, setApproval] = useState('');

  // Fetch current stock threshold from the backend
  useEffect(() => {
    axios.get('http://localhost:3000/api/get-stock-threshold')
      .then((response) => {
        setStockThreshold(response.data.stockThreshold);
      })
      .catch((error) => {
        console.error('Error fetching stock threshold:', error);
      });
  }, []);

  // Handle input change for the new threshold
  const handleInputChange = (e) => {
    setNewThreshold(e.target.value);
  };

  // Stock threshold update submission handler
  const handleStockSubmit = (e) => {
    e.preventDefault();

    const thresholdValue = parseFloat(newThreshold);
    if (isNaN(thresholdValue) || thresholdValue < 0) {
      setApproval('Please enter a valid number for the stock threshold.');
      return;
    }

    axios.post('http://localhost:3000/api/update-stock-threshold', { stockThreshold: thresholdValue })
      .then(() => {
        setApproval('Stock threshold updated successfully.');
        setStockThreshold(thresholdValue);
        setNewThreshold(''); // Clear the input field after successful update
      })
      .catch((error) => {
        console.error('Error updating stock threshold:', error);
        setApproval('Error updating stock threshold.');
      });
  };

  return (
    <div className="stockthreshold-container">
      <div className="stock-form-wrapper">
        <h2 className="form-title">Stock Threshold Management</h2>
        <p className="current-threshold">Current Stock Threshold: <span>{stockThreshold}</span></p>

        <form onSubmit={handleStockSubmit} className="stock-form">
          <div className="input-group">
            <label htmlFor="new-threshold" className="input-label">Update Stock Threshold:</label>
            <input
              type="number"
              id="new-threshold"
              value={newThreshold}
              onChange={handleInputChange}
              placeholder="Enter new threshold"
              className="threshold-input"
            />
          </div>
          <button type="submit" className="submit-button">Update Threshold</button>
        </form>

        {approval && <p className="approval-message">{approval}</p>}
      </div>
    </div>
  );
};

export default StockManagement;

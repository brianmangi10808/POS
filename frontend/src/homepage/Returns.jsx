
import { IoMdArrowRoundBack } from "react-icons/io";
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import './Returns.css'


function Returns() {
  const [transactionType, setTransactionType] = useState('return');  // Default to sale
  const [items, setItems] = useState([{ productId: '', sku: '', quantity: 0 }]);

  const [branchId, setBranchId] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Handle item input change
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...items];

    // Convert the quantity field to a number (parseInt or parseFloat)
    if (name === 'quantity') {
        updatedItems[index][name] = parseInt(value, 10); // Ensuring base 10 number
    } else {
        updatedItems[index][name] = value; // Handle other fields as strings
    }

    setItems(updatedItems);
};


  // Handle adding new item
  const addItem = () => {
      setItems([...items, { productId: '', sku: '', quantity: '' }]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
        items,
        branchId,
        customerName: customerName || null  // Optional customer name
    };

    try {
        const url = transactionType === 'sale'
            ? 'http://localhost:3000/api/update-stock'
            : 'http://localhost:3000/api/return-stock';

        const response = await axios.post(url, payload);
        alert(response.data.message);

        // Reset the form fields
        setItems([{ productId: '', sku: '', quantity: '' }]); // Reset items array
        setBranchId('');
        setCustomerName('');
        setTransactionType('return'); // Reset to default value, if needed

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        alert('An error occurred. Please try again.');
    }
};


  return (
    <div className="form-container">
    <div className="arrow-checkout">
        <NavLink to='/checkout' className='returns-back'>
            <IoMdArrowRoundBack /> Back
        </NavLink>
    </div>
    <h2>Stock Management</h2>
    <div className="form-wrapper">
        <form className="stock-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="transactionType">Transaction Type:</label>
                <select 
                    id="transactionType"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                >
                    <option value="sale">Sale</option>
                    <option value="return">Return</option>
                </select>
            </div>

            {items.map((item, index) => (
                <div key={index} className="item-group">
                    <div className="form-group">
                        <label htmlFor={`productId-${index}`}>Product ID:</label>
                        <input
                            type="text"
                            id={`productId-${index}`}
                            name="productId"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor={`sku-${index}`}>SKU:</label>
                        <input
                            type="text"
                            id={`sku-${index}`}
                            name="sku"
                            value={item.sku}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor={`quantity-${index}`}>Quantity:</label>
                        <input
                            type="number"
                            id={`quantity-${index}`}
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            required
                        />
                    </div>
                </div>
            ))}

            <div className="form-group">
                <button type="button" className="add-item-btn" onClick={addItem}>
                    Add Another Item
                </button>
            </div>

            <div className="form-group">
                <label htmlFor="branchId">Branch ID:</label>
                <input
                    type="text"
                    id="branchId"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="customerName">Customer Name (Optional):</label>
                <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />
            </div>

            <div className="form-group">
                <button type="submit" className="submit-btn">
                    Submit
                </button>
            </div>
        </form>
    </div>
</div>
  )
}

export default Returns

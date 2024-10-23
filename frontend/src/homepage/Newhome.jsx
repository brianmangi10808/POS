import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../signup/UserContext';
import axios from 'axios';
import { DeleteIcon, CloseIcon } from '@chakra-ui/icons';

import "./New.css"
import { Snackbar, Alert, TextField, Button, Modal, Box, Typography } from '@mui/material';
import profile from '../assets/profile.jpg';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import Receipt from './Receipt';
import { useNavigate } from 'react-router-dom';




const Newhome = () => {

  const [cart, setCart] = useState([]);
 
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalCash, setShowModalCash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
 
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState('');

  const [receiptData, setReceiptData] = useState(null);
  const { branchId, setBranchId, products, setProducts, username } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state

  const location = useLocation();
  const navigate = useNavigate();

  
  const handlePrintReceipt = () => {
    window.print(); // Trigger browser print dialog
  };

  useEffect(() => {
    if (location.state?.branchId && branchId === null) {
      setBranchId(location.state.branchId);
    }

    if (branchId) {
      fetch(`https://pos-backend-16dc.onrender.com/category-product?branch_id=${branchId}`)
        .then((response) => response.json())
        .then((data) => {
          const productsWithTaxRate = data.products.map(product => ({
            ...product,
            taxRate: product.tax_rate // Access the tax_rate field
          }));
          setProducts(productsWithTaxRate);
        })
        .catch((error) => console.error('Error fetching products:', error));
    }
    
  }, [branchId, location.state?.branchId, setBranchId, setProducts]);


 

 

  const handlePaymentClick = (method) => {
    setPaymentMethod(method);
    setTotalAmount(calculateTotal());
  
    if (method === 'MPESA') {
      setShowModal(true);
      setShowModalCash(false); // Hide the CASH modal if MPESA is selected
    } else if (method === 'CASH') {
      setShowModalCash(true);
      setShowModal(false); // Hide the MPESA modal if CASH is selected
    }
  };
  
  const handleModalSubmit = async () => {
    let formattedPhoneNumber = phoneNumber.trim();
    if (formattedPhoneNumber.startsWith('0')) {
      formattedPhoneNumber = `254${formattedPhoneNumber.substring(1)}`;
    }

    const totalAmount = calculateTotal();
  
    // Move calculateTotalTax function before it's used
    const calculateTotalTax = () => {
      return cart.reduce((totalTax, item) => {
        const taxAmount = Number(item.selling_price) * item.quantity * Number(item.tax_rate);
        return totalTax + taxAmount;
      }, 0).toFixed(2);
    };

    if (amountReceived < totalAmount) {
      setError('Amount received must be equal to or greater than the total amount');
      setOpenSnackbar(true);
      return;
    }

    const invalidItems = cart.filter(item => !item.sku || !item.quantity);
    if (invalidItems.length > 0) {
      setError('Each item must have a SKU and quantity');
      setOpenSnackbar(true);
      return;
    }

    try {
      const invoiceResponse = await axios.get('https://pos-backend-16dc.onrender.com/api/invoice-number');
      const invoiceNumber = invoiceResponse.data.invoiceNumber;

      const itemList = cart.map((item, index) => ({
        itemSeq: index + 1,
        itemCd: item.sku,
        itemNm: item.name,
        qty: item.quantity,
        prc: item.selling_price.toFixed(2),
        splyAmt: (item.selling_price * item.quantity).toFixed(2),
        taxTyCd: item.tax_rate === 0.16 ? 'B' : 'D',
        taxAmt: (item.selling_price * item.tax_rate * item.quantity).toFixed(2),
        totAmt: (item.selling_price * item.quantity * (1 + item.tax_rate)).toFixed(2),
      }));

      const invoiceData = {
        invcNo: invoiceNumber,
        items: itemList,
        custNm: username || 'Guest',
        totAmt: totalAmount,
        taxAmtB: calculateTotalTax(),
        pmtTyCd: paymentMethod === 'MPESA' ? '01' : '02',
      };

      await axios.post('https://pos-backend-16dc.onrender.com/api/saveTrnsSalesOsdc', invoiceData);

      const transactionResponse = await axios.post('https://pos-backend-16dc.onrender.com/api/transactions', {
        items: cart.map(item => ({
          productId: item.id,
          sku: item.sku,
          quantity: item.quantity,
        })),
        totalAmount,
        paymentMethod,
        invoiceNumber,
      });

      const newReceiptData = {
        businessName: 'My Electronics Shop',
        cashierName: username,
        transactionId: invoiceNumber,
        items: cart,
        totalAmount: calculateTotal(),
        totalTax: calculateTotalTax(),
        paymentMethod,
        date: new Date().toLocaleString(),
      };

      setReceiptData(newReceiptData);
      setCart([]);
      setShowModal(false);
      await axios.post('https://pos-backend-16dc.onrender.com/api/invoice-number/increment');
      navigate('/receipt', { state: { receiptData: newReceiptData } });

    } catch (error) {
      setError('Error during checkout: ' + (error.response?.data || error.message));
      setOpenSnackbar(true);
    }
  };

  const handleAddToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          sku: product.sku || 'default-sku',
          selling_price: Number(product.selling_price)
        }
      ]);
    }
    setSearchTerm("");
  };

  // Function to filter products based on search term
  const searchedProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ));
  };

  
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const selling_priceWithoutTax = Number(item.selling_price) * item.quantity;
      const taxAmount = selling_priceWithoutTax * Number(item.tax_rate); // Assuming tax_rate is in decimal form (e.g., 0.16 for 16%)
      return total + selling_priceWithoutTax + taxAmount;
    }, 0).toFixed(2);
  };
  


const handleAmountReceivedChange = (e) => {
    const receivedAmount = parseFloat(e.target.value) || 0;

    if (receivedAmount < 0) {
      setError('Amount received cannot be negative');
      setIsFormValid(false);
    } else if (e.target.value === '') {
      setError('Please enter an amount');
      setIsFormValid(false);
    } else {
      setError('');
      const newChange = (receivedAmount - totalAmount).toFixed(2);
      setChange(isNaN(newChange) ? 0 : newChange);
      setIsFormValid(receivedAmount >= totalAmount); // Validate if amount is enough
    }

    setAmountReceived(receivedAmount);
  };

  return (
    <div className="home-containers-bar">
      <div className="top-container-bar">
        <div className="username-display-bar">
          <h4>Welcome, {username}</h4>
        </div>
    
        <div className="logout-bar">
        <NavLink to='/'><button className="log-out-nav-bar">LOG OUT</button></NavLink>
        </div>
      </div>
 
      
    <div className="new-checkout">
      <div className="body-home-bar-new">
       
      <div className="product-list-bar">
  {error && <p className="error">{error}</p>}

  {/* Input stays at the top */}
  <input
    type="text"
    placeholder="Search product..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />

  {/* Render filtered products */}
  {searchTerm && searchedProducts.length > 0 ? (
    <div className="search-results">
      {searchedProducts.map((product) => (
        <div className="product-card-bar" key={product.id}>
          <button
             onClick={() => {
                handleAddToCart(product);
                setSearchTerm("");
              }}
            className="product-card-button-bar"
            style={{ all: 'unset', cursor: 'pointer', width: '100%', height: '100%' }}
          >
            <div className="column-product">
            <div>{product.name}</div>
              <div>{product.description}</div>
              <div>{Number(product.selling_price).toFixed(2)}</div>
            </div>
          </button>
        </div>
      ))}
    </div>
  ) : (
    searchTerm && <p>No products found.</p>
  )}
</div>

<div className="cart-container-bar-new">
  <div>
    <table className="cart-table-bar-new">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Qty</th>
          <th>S selling_price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {cart.length > 0 ? (
          cart.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                  min="1"
                  className="cart-quantity-input-new"
                />
              </td>
              <td>KSH {item.selling_price.toFixed(2)}</td>
              <td>KSH {(item.selling_price * item.quantity).toFixed(2)}</td>
              <td>
                <button onClick={() => handleRemoveFromCart(item.id)} className="cart-remove-button-new">
                  <DeleteIcon />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center' }}>
              No items in the cart
            </td>
          </tr>
        )}
      </tbody>
    </table>

    {/* Display total amount only if cart has items */}
    {cart.length > 0 && (
      <p className="cart-summary-new">Total Amount: KSH {calculateTotal()}</p>
    )}
  </div>
</div>

      </div>

  
      <div className="cash-mpesa-new">    
        <h2>PAYMENT MODE </h2>
      <div className="payment-button-bar-new">
            <button className="pay-button mpesa-button-new" onClick={() => handlePaymentClick('MPESA')}>
              Pay with MPESA
            </button>
            <button className="pay-button cash-button-new" onClick={() => handlePaymentClick('CASH')}>
              Pay with CASH
            </button>
          </div>

      {showModal && (
        <div className="modal-bar-new">
          <h2>MPESA Payment</h2>
          <input
            type="text"
            
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={handleModalSubmit}>Submit Payment</button>
          <button onClick={() => setShowModal(false)}><CloseIcon /></button>
        </div>
      )}

      {/* Cash Payment Modal */}
      {showModalCash && (
  <div className="modal-bar-new">
    <h2>CASH Payment</h2>
    <input
      type="number"
      placeholder="Amount Received"
      value={amountReceived}
      onChange={handleAmountReceivedChange}
    />
    <h3>Change: KSH {change ? Number(change).toFixed(2) : '0.00'}</h3>
    {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
    <button onClick={handleModalSubmit} disabled={!isFormValid}>Submit Payment</button>
    <button onClick={() => setShowModalCash(false)}><CloseIcon /></button>
  </div>
)} 

<div className="receipt-printing">
    <div>
    <button className="pay-button recipt-button-new" onClick={handlePrintReceipt}>
                  PRINT
                </button>
            </div>
            <div>   
            <button className="pay-button receipt-button-old" onClick={() => handlePaymentClick('MPESA')}>
           DONT  PRINT 
            </button>
            </div>
            </div>

      </div>
      </div>
      
    </div>
  );
};

export default Newhome
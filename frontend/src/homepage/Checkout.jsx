import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../signup/UserContext';
import axios from 'axios';
import { DeleteIcon, CloseIcon } from '@chakra-ui/icons';
import './Check.css';
import profile from '../assets/profile.jpg';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const Checkout = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalCash, setShowModalCash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [imageUrls, setImageUrls] = useState({});
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // Initialize selectedCategory

  const { branchId, setBranchId, products, setProducts, username } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.branchId && branchId === null) {
      setBranchId(location.state.branchId);
    }

    if (branchId) {
      fetch(`http://localhost:3000/api/category-product?branch_id=${branchId}`)
        .then((response) => response.json())
        .then((data) => setProducts(data.products))
        .catch((error) => console.error('Error fetching products:', error));
    }
  }, [branchId, location.state?.branchId, setBranchId, setProducts]);

  const categories = [...new Set(products.map((product) => product.category_name))];

  const filteredProducts = searchQuery
    ? products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : selectedCategory
    ? products.filter((product) => product.category_name === selectedCategory)
    : products;

  // The rest of your code continues...

  useEffect(() => {
    const fetchImages = async () => {
      const newImageUrls = {};
      for (const product of products) {
        try {
          const response = await axios.get(`http://localhost:3000/api/products/${product.id}/image`, {
            responseType: 'arraybuffer'
          });
          const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(imageBlob);
          newImageUrls[product.id] = imageUrl;
        } catch (error) {
          console.error(`Error fetching image for product ${product.id}:`, error);
          newImageUrls[product.id] = profile;
        }
      }
      setImageUrls(newImageUrls);
    };

    if (products.length > 0) {
      fetchImages();
    }
  }, [products]);

  const handlePaymentClick = (method) => {
    setPaymentMethod(method);
    setTotalAmount(calculateTotal());

    if (method === 'MPESA') {
      setShowModal(true);
    } else if (method === 'CASH') {
      setShowModalCash(true);
    }
  };
  
  const handleModalSubmit = async () => {
    let formattedPhoneNumber = phoneNumber.trim();
    if (formattedPhoneNumber.startsWith('0')) {
        formattedPhoneNumber = `254${formattedPhoneNumber.substring(1)}`;
    }
    const totalAmount = calculateTotal();

    const invalidItems = cart.filter(item => !item.sku || !item.quantity);
    if (invalidItems.length > 0) {
        setError('Each item must have a SKU and quantity');
        return;
    }

    try {
        // Prepare transaction data
        const transactionData = {
            items: cart.map(item => ({
                productId: item.id,
                sku: item.sku,
                quantity: item.quantity
            })),
            totalAmount: totalAmount,
            paymentMethod: paymentMethod // Ensure this is correctly set
        };

        if (username) {
            transactionData.customerName = username; // Include if username is available
        }

        console.log('Transaction Data:', transactionData); // Log transaction data

        // Make API request for transactions
        const transactionResponse = await axios.post('http://localhost:3000/api/transactions', transactionData);
        const transactionId = transactionResponse.data.transactionId;

        // Handle MPESA or Cash payments
        if (paymentMethod === 'MPESA') {
            const response = await fetch('http://localhost:3000/api/mpesa/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    phoneNumber: formattedPhoneNumber,
                    accountReference: 'Swiftel Fiber',
                    transactionId: transactionId
                })
            });

            const result = await response.text();
            alert(result);
        } else if (paymentMethod === 'CASH') {
            alert(`Cash payment of KSH ${totalAmount} received successfully!`);
        }

        // Prepare stock update data
        const stockUpdateData = {
            branchId: branchId, // Ensure branchId is correctly set
            items: cart.map(item => ({
                productId: item.id,
                sku: item.sku,
                quantity: item.quantity
            })),
            totalAmount: totalAmount,
            paymentMethod: paymentMethod // Ensure this is included if required by the server
        };

        console.log('Stock Update Data:', stockUpdateData); // Log stock update data

        // Make API request to update stock
        const stockResponse = await axios.post('http://localhost:3000/api/update-stock', stockUpdateData);

        // Check stock update response if needed
        console.log('Stock Update Response:', stockResponse.data);

        // Clear the cart and close modals
        setCart([]);
        setShowModal(false);
        setShowModalCash(false);
    } catch (error) {
        setError('Error during checkout');
        console.error('Error during checkout:', error.response ? error.response.data : error.message);
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
          price: Number(product.price)
        }
      ]);
    }
  };

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
    return cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2);
  };

  const handleAmountReceivedChange = (e) => {
    const receivedAmount = parseFloat(e.target.value) || 0;
    setAmountReceived(receivedAmount);
    const newChange = (receivedAmount - totalAmount).toFixed(2);
    setChange(isNaN(newChange) ? 0 : newChange);
  };

  return (
    <div className="home-container">
      <div className="top-container">
        <div className="username-display">
          <h4>Welcome, {username}</h4>
        </div>
        <div className="search-inputs">
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

        </div>
        <div className="logout">
        <NavLink to='/'><button className="log-out-nav">LOG OUT</button></NavLink>
        </div>
      </div>

      <div className="body-home">
        <div className="sidebar-home">
          <h2>Categories</h2>
          <ul>
            {categories.map((category) => (
              <li key={category} onClick={() => setSelectedCategory(category)}>
                {category}
              </li>
            ))}
          </ul>
        </div>

        <div className="product-list">
          {error && <p className="error">{error}</p>}
          {filteredProducts.map((product) => (
         <div className="product-card" key={product.id}>
         <button 
           onClick={() => handleAddToCart(product)} 
           className="product-card-button"
           style={{ all: 'unset', cursor: 'pointer', width: '100%', height: '100%' }}
         >
           <img
             src={imageUrls[product.id] || profile}
             alt={product.name}
             className="product-image"
           />
           <h3>{product.name}</h3>
           <p>{product.description}</p>
           <p>Price: KSH {Number(product.price).toFixed(2)}</p>
           <p style={{ color: 'green', fontSize: '16px', fontWeight: '500' }}>ADD</p>
         </button>
       </div>
       
          ))}
        </div>

        <div className="cart-container">
          <h2>Cart</h2>
          {cart.length > 0 ? (
            <div>
              <ul>
                {cart.map((item) => (
                  <li key={item.id}>
                    <p>{item.name} - KSH {item.price.toFixed(2)} x {item.quantity}</p>
                    <button onClick={() => handleRemoveFromCart(item.id)}>
                      <DeleteIcon />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                    />
                  </li>
                ))}
              </ul>
              <p>Total: KSH {calculateTotal()}</p>
              <div className="payment-button">
                <button style={{ backgroundColor: '#28a745' }} onClick={() => handlePaymentClick('MPESA')}>
                  Pay with MPESA
                </button>
                <button style={{ backgroundColor: '#ffc107' }} onClick={() => handlePaymentClick('CASH')}>
                  Pay with CASH
                </button>
              </div>
            </div>
          ) : (
            <p>Your cart is empty</p>
          )}
        </div>
      </div>

      {/* MPESA Payment Modal */}
      {showModal && (
        <div className="modal">
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
        <div className="modal">
          <h2>CASH Payment</h2>
          <input
            type="number"
            placeholder="Amount Received"
            value={amountReceived}
            onChange={handleAmountReceivedChange}
          />
          <p>Change: KSH {change ? Number(change).toFixed(2) : '0.00'}</p>
          <button onClick={handleModalSubmit}>Submit Payment</button>
          <button onClick={() => setShowModalCash(false)}><CloseIcon /></button>
        </div>
      )}
    </div>
  );
};

export default Checkout;

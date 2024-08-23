import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../signup/UserContext';
import axios from 'axios';
import { DeleteIcon,CloseIcon } from '@chakra-ui/icons';
import './Home.css';
import profile from '../assets/profile.jpg';

const Home = () => {
  const { username } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalCash, setShowModalCash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [imageUrls, setImageUrls] = useState({});
   const[amountReceived, setAmountReceived] = useState({})
   const[change,setChange] = useState({})


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/categories');
        setCategories(response.data);

        if (response.data.length > 0) {
          const firstCategory = response.data[0];
          setActiveCategory(firstCategory.id);
          fetchProducts(firstCategory.id);
        }
      } catch (err) {
        setError('No products found for the categories');
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

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
          newImageUrls[product.id] = profile; // Fallback image
        }
      }
      setImageUrls(newImageUrls);
    };

    if (products.length > 0) {
      fetchImages();
    }
  }, [products]);

  const fetchProducts = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/categories/${categoryId}/products`);
      setProducts(response.data);
      setActiveCategory(categoryId);
    } catch (err) {
      setError('No products found for this category');
      console.error(err);
    }
  };

  const handlePaymentClick = (method) => {
    setPaymentMethod(method);
    if (method === 'MPESA') {
      setTotalAmount(calculateTotal()); 
      setShowModal(true); 
    }
     else if(method === 'CASH'){
      setTotalAmount(calculateTotal)
      setShowModalCash(true);
    }
  };

  const handleModalSubmit = async () => {
    let formattedPhoneNumber = phoneNumber.trim();
  
    if (formattedPhoneNumber.startsWith('0')) {
      formattedPhoneNumber = `254${formattedPhoneNumber.substring(1)}`;
    }
  
    const totalAmount = calculateTotal(); // Ensure this value is correctly set
  
    try {
      const transactionResponse = await axios.post('http://localhost:3000/api/transactions', {
        customerName: username,
        items: cart.map(item => ({
          productId: item.id,
          sku: item.sku,
          quantity: item.quantity
        })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod
      });
  
      const transactionId = transactionResponse.data.transactionId;
  
      if (paymentMethod === 'MPESA') {
        const response = await fetch('http://localhost:3000/api/mpesa/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
  
      await axios.post('http://localhost:3000/api/update-stock', {
        items: cart.map(item => ({
          productId: item.id,
          sku: item.sku,
          quantity: item.quantity
        })),
        totalAmount: totalAmount // Include totalAmount here if needed
      });
  
      setCart([]);
      setShowModal(false);
      setShowModalCash(false);
    } catch (error) {
      setError('Error during checkout');
      console.error('Error during checkout:', error.response ? error.response.data : error.message);
    }
  };
  
  
  const handleAddToCart = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);
  
    if (existingProduct) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, sku: product.sku }]); // Add SKU here
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
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAmountReceivedChange = (e) => {
    const receivedAmount = parseFloat(e.target.value) || '';
    setAmountReceived(receivedAmount);
    setChange(receivedAmount - totalAmount);
  };
// Function to check the transaction status
const checkTransactionStatus = async (transactionId) => {
  const token = await getToken(); // Reuse your existing token function

  const data = {
      Initiator: 'testapiuser',
      SecurityCredential: 'ClONZiMYBpc65lmpJ7nvnrDmUe0WvHvA5QbOsPjEo92B6IGFwDdvdeJIFL0kgwsEKWu6SQKG4ZZUxjC', // Replace with actual encrypted credential
      CommandID: 'TransactionStatusQuery',
      TransactionID: transactionId, // Transaction ID to check
      PartyA: shortCode, // Your shortcode
      IdentifierType: '4', // Type of organization receiving the transaction (4 for shortcode)
      ResultURL: 'https://yourdomain.com/mpesa/transactionstatus/result', // Replace with your actual result URL
      QueueTimeOutURL: 'https://yourdomain.com/mpesa/transactionstatus/timeout', // Replace with your actual timeout URL
      Remarks: 'Checking transaction status',
      Occasion: 'Transaction status check'
  };

  try {
      const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query', data, {
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });
      console.log('Transaction Status Response:', response.data);
      return response.data; // Return the response data for further processing
  } catch (error) {
      console.error('Error checking transaction status:', error.response ? error.response.data : error.message);
  }
};


  return (
    <div className="home-container">
      <div className="top-container">
        <div className="username-display">
          <h4>Welcome, {username}</h4>
        </div>
        <div className="search-input">
          <input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="body-home">
        <div className="sidebar-home">
          <h2>Categories</h2>
          <ul>
            {categories.map((category) => (
              <li
                key={category.id}
                onClick={() => fetchProducts(category.id)}
                className={activeCategory === category.id ? 'active' : ''}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="product-list">
          {error && <p className="error">{error}</p>}
          {activeCategory === null ? (
            <p>Please select a category</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <p>No products available in this category.</p>
              ) : (
                filteredProducts.map((product) => (
                  <div className="product-details" key={product.id}>
                    <div className="protruding-image-container">
                      <img
                        src={imageUrls[product.id] || profile}
                        alt="Product"
                        className='protruding-image'
                      />
                    </div>
                    <div className="lower-details">
                      <h3>{product.name}</h3>
                      <p>KSH <span>{product.price}</span></p>
                      <div className="btn-container">
                        <button className="checkout-product-btn" onClick={() => handleAddToCart(product)}>ADD</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="checkout-form">
          <div className="cart-summary">
            <h3>Cart Items:</h3>
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              <ul className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">KSH {item.price.toFixed(2)}</span>
                    </div>
                    <div className="item-actions">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                        className="quantity-input"
                      />
                      <button onClick={() => handleRemoveFromCart(item.id)} className="delete-btn">
                        <DeleteIcon boxSize={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </ul>
            )}
            <h3 className="total-price">Total: KSH {calculateTotal()}</h3>
            <div className="cash-mpesa-layout">
              <button
                className={`complete-purchase-btn ${paymentMethod === 'MPESA' ? 'active' : ''}`}
                onClick={() => handlePaymentClick('MPESA')}
              >
                MPESA
              </button>
              <button
                className={`complete-purchase-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                onClick={() => handlePaymentClick('CASH')}
              >
                CASH
              </button>
              <button
                className={`complete-purchase-btn ${paymentMethod === 'MULTIPLE' ? 'active' : ''}`}
                onClick={() => handlePaymentClick('MULTIPLE')}
              >
                MULTIPLE PAY
              </button>
            </div>
          </div>
        </div>
      </div>
  
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Complete MPESA Payment</h2>
      <h3>Total : KSH {totalAmount}</h3>
      <label className='amount_cash'  htmlFor="phoneNumber">Phone Number:</label>
      <input
        type="tel"
        id="phoneNumber"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={handleModalSubmit}>Finalize Payment</button>
      <button onClick={() => setShowModal(false)}><CloseIcon /></button>
    </div>
  </div>
)}
{showModalCash && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Complete Cash Payment</h2>
            <h3>Total : KSH {totalAmount}</h3>
            <label className='amount_cash' htmlFor="amountReceived">Amount Received:</label>
            <input
              type="number"
              id="amountReceived"
              value={amountReceived}
              onChange={handleAmountReceivedChange}
            />
            <label className='amount_cash' htmlFor="change">Change:</label>
            <input
              type="text"
              id="change"
              value={change}
              readOnly
            />
            <button onClick={handleModalSubmit}>Finalize Payment</button>
            <button onClick={() => setShowModalCash(false)}><CloseIcon /></button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;

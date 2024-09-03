import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../signup/UserContext';
import axios from 'axios';
import { DeleteIcon, CloseIcon } from '@chakra-ui/icons';
import './Home.css';
import profile from '../assets/profile.jpg';
import { useReactToPrint } from 'react-to-print';
import Receipt from './Receipt';
import { v4 as uuidv4 } from 'uuid';

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
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState('');
  const [kraDetails, setKraDetails] = useState(null); // New state to store kraDetails
  const [showReceiptModal, setShowReceiptModal] = useState(false); // State to manage receipt modal

  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: 'KRA-Receipt',
  });

  const generateReceiptNumber = () => {
    return `RCPT-${uuidv4()}`; // Generate a unique receipt number
  };

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
    setTotalAmount(calculateTotal());

    if (method === 'MPESA') {
      setShowModal(true);
    } else if (method === 'CASH') {
      setShowModalCash(true);
    }
  };

  const handleModalSubmit = async () => {
    const receiptNumber = generateReceiptNumber();
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
        totalAmount: totalAmount
      });

      // Prepare KRA details for receipt
      const kraDetails = {
        taxpayerName: 'SWIFTEL FIBER',
        pin: 'P051402944X',
        address: 'KASARANI ,mwiki',
        scuId: 'KRA1234567890',
        signature: 'ABCD1234EFGH5678',
        receiptNumber: receiptNumber, // Use the generated receipt number
      };

      setKraDetails(kraDetails); // Store kraDetails in state
      setShowReceiptModal(true); // Show the receipt modal

      // Clear the cart and close modals after printing
      
      setShowModal(false);
      setShowModalCash(false);
    } catch (error) {
      setError('Error during checkout');
      console.error('Error during checkout:', error.response ? error.response.data : error.message);
    }
    //  setCart([]);
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
      setCart([...cart, { ...product, quantity: 1, sku: product.sku, price: product.price }]);
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
      {filteredProducts.map((product) => (
        <div className="product-details" key={product.id} onClick={() => handleAddToCart(product)}>
          <div className="protruding-image-container">
            <img
              src={imageUrls[product.id] || profile}
              alt="Product"
              className="protruding-image"
            />
          </div>
          <div className="lower-details">
            <h3>{product.name}</h3>
            <span className="item-price">KSH {Number(product.price || 0).toFixed(2)}</span>

            <div className="btn-container">
              <button
                className="checkout-product-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the parent div's onClick from triggering
                  handleAddToCart(product);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
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
      <span className="item-price">KSH {Number(item.price || 0).toFixed(2)}</span>
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

      {/* Receipt Modal */}
      {showReceiptModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <Receipt
        ref={receiptRef}
        transactionId="TX123456" // Pass the correct transaction ID here
        customerName={username}
        cart={cart}
        totalAmount={totalAmount}
        paymentMethod={paymentMethod}
        kraDetails={kraDetails}
      />
      <button onClick={() => setShowReceiptModal(false)}><CloseIcon /></button>
      <button onClick={handlePrint}>Print Receipt</button>
    </div>
  </div>
)}



      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Complete MPESA Payment</h2>
            <h3>Total : KSH {totalAmount}</h3>
            <label className='amount_cash' htmlFor="phoneNumber">Phone Number:</label>
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

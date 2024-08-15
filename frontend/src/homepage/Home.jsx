import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../signup/UserContext';
import axios from 'axios';
import { DeleteIcon } from '@chakra-ui/icons';
import './Home.css';
import profile from '../assets/profile.jpg';
import { NavLink, Outlet } from 'react-router-dom';

const Home = () => {
  const { username } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState({});

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

  const handleAddToCart = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
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
            <button className="complete-purchase-btn">Complete Purchase</button>
          </div>
          <li className="discord">
            <NavLink to='/home/checkout' className="sidebar-names">Checkout</NavLink>
          </li>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;

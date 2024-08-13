import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../signup/UserContext';
import axios from 'axios';
import profile from '../assets/profile.jpg';
import './Home.css';

import { NavLink, Outlet } from 'react-router-dom';

const Home = () => {
  const { username } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all categories on component mount
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/categories');
        setCategories(response.data);

        // Set the first category as active by default
        if (response.data.length > 0) {
          const firstCategory = response.data[0];
          setActiveCategory(firstCategory.id);
          fetchProducts(firstCategory.id); // Fetch products for the first category
        }
      } catch (err) {
        setError('NO  Product added to that category');
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/categories/${categoryId}/products`);
      setProducts(response.data);
      setActiveCategory(categoryId);
    } catch (err) {
      setError('NO  Product added to that category');
      console.error(err);
    }
  };

  return (
    <div className="home-container">
      <div className="top-container">
        <div className="username-display">
          <h4>Welcome, {username}</h4>
        </div>
        <div className="search-input">
          <input type="search" placeholder="search .. ?" />
        </div>
      </div>
      <div className="body-home">
        <div className="sidebar-home">
          <h2>Categoris</h2>
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
            <div className='product-grid'>
              {products.length === 0 ? (
                <p>No products available in this category.</p>
              ) : (
                products.map((product) => (
                  <div className='product-details' key={product.id}>
                    <div className="image-container">
                    <img src={profile} alt="map" />
                    </div>
                    <div className="lower-details">
                    <h3>{product.name}</h3>
                   
                    <p>KSH <span>{product.price}</span></p>
                    
                    <div className="btn-container">
                    <button className='checkout-product-btn'>ADD</button>
                   </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="checkout-form">
          <h2>Checkout</h2>
          <li className='discord'>
                            <NavLink to='/home/checkout' className="sidebar-names">Checkout</NavLink>
                        </li>
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Home;

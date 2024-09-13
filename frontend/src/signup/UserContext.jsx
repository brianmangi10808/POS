// UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [branchId, setBranchId] = useState(() => localStorage.getItem('branchId') || null);
  const [products, setProducts] = useState(() => {
    const storedProducts = localStorage.getItem('products');
    return storedProducts ? JSON.parse(storedProducts) : [];
  });

  // Sync state changes with localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);

  useEffect(() => {
    if (branchId) {
      localStorage.setItem('branchId', branchId);
    } else {
      localStorage.removeItem('branchId');
    }
  }, [branchId]);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    } else {
      localStorage.removeItem('products');
    }
  }, [products]);

  return (
    <UserContext.Provider value={{ username, setUsername, branchId, setBranchId, products, setProducts }}>
      {children}
    </UserContext.Provider>
  );
};

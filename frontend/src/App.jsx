import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './signup/Login';
import Home from './homepage/Home';
import Admin from './adminpage/Admin';
import Register from './signup/Register';
import { UserProvider } from './signup/UserContext';
import Category from './adminpage/Category';
import Users from './adminpage/Users';
import Sales from './adminpage/Sales';
import Dashboard from './adminpage/Dashboard';
import Product from './adminpage/Product';
import Checkout from './homepage/Checkout';
import BranchForm from './adminpage/BranchForm';
import Inventory from './adminpage/Inventory';

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/home' element={<Home />} >
          <Route path='checkout' element={<Checkout />} />
          <Route index element={<Checkout />} />
        </Route>
        <Route path='/admin' element={<Admin />}>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='category' element={<Category />} />
          <Route path='users' element={<Users />} />
          <Route path='inventory' element={<Inventory/>} />
          <Route path='branchform' element={<BranchForm />} />
          <Route path='sales' element={<Sales />} />
          <Route path='product' element={<Product />} />
          <Route index element={<Dashboard />} /> {/* Default route */}
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;

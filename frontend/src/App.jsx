import React from 'react';
import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
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
import Returns from './homepage/Returns';
import BranchForm from './adminpage/BranchForm';
import Inventory from './adminpage/Inventory';
import Customer from './adminpage/Customer';
import Notification from './adminpage/Notification';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from './adminpage/Modal';
import Receipt from './homepage/Receipt';
import Orders from './stock/Orders';
import Transfers from './stock/Transfers';
import Movement from './stock/Movement';
import CreateUser from './adminpage/Createuser';
import NewHome from './homepage/Newhome';
import EmailSettings from './adminpage/EmailSettings';
import StockManagement from './adminpage/StockManagement';

function App() {
  return (
    <div className="app-container">
      <UserProvider>
        <ToastContainer />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/returns' element={<Returns />} />
          <Route path='/receipt' element={<Receipt />} />
          <Route path='/createuser' element={<CreateUser />} />
          <Route path='/movement' element={<Movement />} />
          
          <Route path='/home' element={<Home />} >
            <Route index element={<Checkout />} />
          </Route>

          <Route path='/admin' element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='customer' element={<Customer />} />
            <Route path='category' element={<Category />} />
            <Route path='notification' element={<Notification />} />
            <Route path='users' element={<Users />} />
            <Route path='inventory' element={<Inventory />}>
              <Route index element={<Navigate to="transfers" replace />} /> 
              <Route path='orders' element={<Orders />} />
              <Route path='returns' element={<Returns />} />
              <Route path='transfers' element={<Transfers />} />
            </Route>
            <Route path='branchform' element={<BranchForm />} />
            <Route path='sales' element={<Sales />}>
              <Route path='modal' element={<Modal />} />
            </Route>
            <Route path='product' element={<Product />} />
          </Route>

          <Route path='/newhome' element={<NewHome />} />
          <Route path='/emailsettings' element={<EmailSettings />} />
          <Route path='/stockmanagment' element={<StockManagement />} />
        </Routes>
      </UserProvider>
    </div>
  );
}

export default App;

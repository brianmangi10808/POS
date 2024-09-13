import React from 'react';
import './Inventory.css';
import { NavLink, Outlet } from 'react-router-dom';

function Inventory() {
  return (
    <div className='stock-body-container'>
      <div className="inventory-header">
        <h2>Stock Control</h2>
      </div>
      <div className="order-transfer-return">
        <NavLink 
          to='orders' 
          className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Orders
        </NavLink>
        <NavLink 
          to='transfers' 
          className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Transfers
        </NavLink>
        <NavLink 
          to='returns' 
          className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Returns
        </NavLink>
      </div>
      
      <Outlet/>
    </div>
  );
}

export default Inventory;

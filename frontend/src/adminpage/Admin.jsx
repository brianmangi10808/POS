
import React, { useState} from 'react';
import './admin.css'

import { useContext } from 'react';
import { UserContext } from '../signup/UserContext';
import { NavLink } from 'react-router-dom';

const Admin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };
    const { username } = useContext(UserContext);

  return (
    <div >
    <div className="container">
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <button className="close-button" onClick={toggleSidebar}>×</button>
      <div className="profile-user">
        <div className="icon-profile"></div>
      
        <div className="username"> {username}</div>
        
      </div>
        <ul>
             <li className='discord'>
                <NavLink to='/discord' className="sidebar-names">INVENTORY</NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">SALES </NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">CATEGORY</NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">USER</NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">CUSTOMER </NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">STOCK</NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">DISCOUNTS</NavLink>
              </li>
              <li className='discord'>
                <NavLink to='/discord'  className="sidebar-names">BRANCH </NavLink>
              </li>
        </ul>
      </nav>
      <div className="content">
        <header>
          <button className="menu-button" onClick={toggleSidebar}>☰</button>
        </header>
        <main>
        <div className="outer-container">
          <div className="outer-left-container"></div>
          <div className="line-container"></div>
          <div className="outer-right-container"></div>
         
        </div>
        </main>
      </div>
    </div>
    </div>
  )
}

export default Admin

import React, { useState, useEffect, useContext } from 'react';
import './admin.css';
import axios from 'axios';

import { UserContext } from '../signup/UserContext';
import { NavLink, Outlet } from 'react-router-dom';


const Admin = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [signupData, setSignupData] = useState([]);
    const { username } = useContext(UserContext);

    useEffect(() => {
        const fetchSignupData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/signup-data');
                const formattedData = response.data.map(item => ({
                    name: item.date,
                    signups: item.count,
                }));
                setSignupData(formattedData);
            } catch (error) {
                console.error('Error fetching signup data:', error);
            }
        };
        fetchSignupData();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="app-container">
    <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleSidebar}>×</button>
        <div className="profile-section">
            <div className="profile-icon"></div>
            <div className="profile-username">{username}</div>
        </div>
        <ul className="nav-links">
            <li><NavLink to='/admin/dashboard' className="nav-item">DASHBOARD</NavLink></li>
            <li><NavLink to='/admin/sales' className="nav-item">SALES</NavLink></li>
            <li><NavLink to='/admin/category' className="nav-item">CATEGORY</NavLink></li>
            <li><NavLink to='/admin/product' className="nav-item">PRODUCTS</NavLink></li>
            <li><NavLink to='/admin/users' className="nav-item">USERS</NavLink></li>
            <li><NavLink to='/admin/customer' className="nav-item">CUSTOMER</NavLink></li>
            <li><NavLink to='/admin/inventory' className="nav-item">STOCK</NavLink></li>
            <li><NavLink to='/admin/branchform' className="nav-item">STORES</NavLink></li>
        </ul>
    </nav>
    <div className="content">
        <header>
            <button className="menu-button" onClick={toggleSidebar}>☰</button>
        </header>
        <Outlet/>
    </div>
</div>

    );
}

export default Admin;
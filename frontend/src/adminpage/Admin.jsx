
import React, { useState, useEffect, useContext } from 'react';
import './admin.css';
import axios from 'axios';

import { UserContext } from '../signup/UserContext';
import { NavLink, Outlet } from 'react-router-dom';
import Dashboard from './Dashboard';

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
        <div>
            <div className="container">
                <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <button className="close-button" onClick={toggleSidebar}>×</button>
                    <div className="profile-user">
                        <div className="icon-profile"></div>
                        <div className="username">{username}</div>
                    </div>
                    <ul>
                        <li className='discord'>
                            <NavLink to='/admin/dashboard' className="sidebar-names">Dashboard</NavLink>
                        </li>
                        <li className='discord'>
                            <NavLink to='/admin/sales' className="sidebar-names">SALES</NavLink>
                        </li>
                        <li className='discord'>
                            <NavLink to='/admin/category' className="sidebar-names">CATEGORY</NavLink>
                        </li>
                        <li className='discord'>
                            <NavLink to='/admin/product' className="sidebar-names">PRODUCT</NavLink>
                        </li>
                        <li className='discord'>
                            <NavLink to='/admin/users' className="sidebar-names">USER</NavLink>
                        </li>
                        <li className='discord'>
                            <NavLink to='/customer' className="sidebar-names">CUSTOMER</NavLink>
                        </li>
                        <li className='discord'>
                            <NavLink to='/stock' className="sidebar-names">STOCK</NavLink>
                        </li>
                       
                        <li className='discord'>
                            <NavLink to='/branch' className="sidebar-names">BRANCH</NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="content">
                    <header>
                        <button className="menu-button" onClick={toggleSidebar}>☰</button>
                    </header>
                    <Outlet/>
                </div>
            </div>
        </div>
    );
}

export default Admin;
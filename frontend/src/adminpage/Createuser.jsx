import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Createuser.css';

const Createuser = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setMessage('Invalid email format');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('https://pos-backend-16dc.onrender.com/api/signup', { name, email, password, role });
            setMessage(response.data.message);
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (err) {
            console.error('Error creating user:', err.response?.data || err.message);
            setMessage(err.response?.data?.error || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="create-user-container">
            <h2>Create User</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="user">User</option>
                       
                    </select>
                </div>
                <button className='btn-btn' type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create User'}
                </button>
            </form>
        </div>
    );
};

export default Createuser;

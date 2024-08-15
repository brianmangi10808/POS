

import './Signup.css'
import axios from 'axios';
import './Signup.css';
import React, { useState } from 'react';

import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import  { useContext } from 'react';
import { UserContext } from './UserContext'; // Adjust the path as necessary



function Login() {
    const { setUsername } = useContext(UserContext);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData(e.target);
        const email = formData.get('email'); // Extract email from FormData
        const password = formData.get('password');
    
        const data = {
            email,
            password,
        };
    
        // Extract username from email
        const username = email.split('@')[0];
        setUsername(username); // Store username in context
        localStorage.setItem('username', username); 
        console.log('Form Data:', data); // Print the data to the console
    
        try {
            const response = await axios.post('http://localhost:3000/api/login', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const { user, message } = response.data;
            if (response.status === 200) {
                if (user.role === 'admin') {
                    navigate('/admin');
                } else if (user.role === 'user') {
                    navigate('/home');
                } else {
                    setError('Invalid credentials');
                }
            } else {
                setError(message);
            }
    
            console.log('Success:', response.data);
        } catch (error) {
            if (error.response) {
                console.error('Error:', error.response.data.error);
            } else if (error.request) {
                console.error('Error: No response received');
            } else {
                console.error('Error:', error.message);
            }
        }
    };
    

  
  return (
    <>

    <div className='login-page body'>
 

<div className='login-form'>
   <h1>Welcome to Swiftytelk !</h1>
   <p>Login to your Account</p>
   <form onSubmit={handleSubmit}>   
    <div className='login-input'>
    <label>Email</label>
    <input type="email" 
    name='email'
    placeholder='Email ...'
  />
    </div>
<div className='login-input'>
    <label>Password</label>
    <input
    type={passwordVisible ? 'text' : 'password'}
    placeholder='password'
    name='password'
   />
     <button type="button" onClick={togglePasswordVisibility}>
        {passwordVisible ? 'Hide' : 'Show'}
      </button>
</div>
 <div className='login-button'>
    <button type='submit'>Login</button>
    
    <NavLink to='/register' className="nav-link"> <span>Create An Account</span></NavLink>
 </div>
   </form>
  
</div>
    </div>
    </>
  )
}

export default Login
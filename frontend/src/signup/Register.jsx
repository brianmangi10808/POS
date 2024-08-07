import graph from '../assets/login.jpg';
import './Signup.css';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
   
  const navigate = useNavigate();

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        };
        console.log('Form Data:', data); // Print the data to the console


        try {
            const response = await axios.post('http://localhost:3000/api/signup', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            navigate('/');
            console.log('Success:', response.data);
            // Handle successful registration (e.g., redirect to login)
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                alert('user aready exist')
                console.error('Error:', error.response.data.error);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error: No response received');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <div className='login-page body'>
            <div className='login-form'>
                <h1>Welcome to Swiftytelk!</h1>
                <p>Create an Account</p>
                <form onSubmit={handleSubmit}>   
                    <div className='login-input'>
                        <label>Names</label>
                        <input type="text" 
                               name="name"
                               placeholder='Names ...'
                               required
                        />
                    </div>
                    <div className='login-input'>
                        <label>Email</label>
                        <input type="email" 
                               name='email'
                               placeholder='Email ...'
                               required
                        />
                    </div>
                    <div className='login-input'>
                        <label>Password</label>
                        <input type={passwordVisible ? 'text' : 'password'}
                               name='password'
                               placeholder='password'
                               required
                        />
                        <button type="button" onClick={togglePasswordVisibility}>
                            {passwordVisible ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <div className='login-button'>
                        <button type='submit'>Create account</button>
                        <NavLink to='/' className="nav-link"> Have an account? <span >Login</span> </NavLink>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;

import React, { useState, useContext } from 'react';
import { TextField, Button, IconButton, Typography, Snackbar, Alert } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from './UserContext'; // Ensure the path is correct

function Login() {
  const { setUsername, setBranchId, setProducts } = useContext(UserContext);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const data = { email, password };
    const username = email.split('@')[0];
    setUsername(username);

    try {
      const response = await axios.post('http://102.130.118.213/api/login', data, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { user, products, message } = response.data;
      if (response.status === 200) {
        if (user && user.branch_id) {
          setBranchId(user.branch_id);
          setProducts(products);
          const navigateTo = user.role === 'admin' ? '/admin' : '/checkout';
          navigate(navigateTo);
        } else {
          setError('User data is missing');
          setOpenSnackbar(true);
        }
      } else {
        setError(message || 'Login failed');
        setOpenSnackbar(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'An error occurred';
      setError(errorMsg);
      setOpenSnackbar(true);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '400px', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <Typography variant="h4" gutterBottom align="center">
          Welcome to Swiftytelk!
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center">
          Login to your Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            name="email"
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <IconButton onClick={togglePasswordVisibility}>
                  {passwordVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '20px' }}
          >
            Login
          </Button>
        </form>

        {error && (
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={() => setOpenSnackbar(false)}
          >
            <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
              {error}
            </Alert>
          </Snackbar>
        )}
      </div>
    </div>
  );
}

export default Login;

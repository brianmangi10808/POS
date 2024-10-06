import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Category.css'

const EmailSettings = () => {
  const [emailSettings, setEmailSettings] = useState({
    user_email: '',
    pass: '',
    from_email: '',
    to_email: ''
  });
  const [emailMessage, setEmailMessage] = useState('');

  // Fetch email settings when the component loads
  useEffect(() => {
    axios.get('http://localhost:3000/api/email-settings')
      .then((response) => {
        setEmailSettings(response.data);
      })
      .catch((err) => {
        console.error('Error fetching email settings:', err);
      });
  }, []);

  // Update email settings in the state
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };

  // Handle form submission to update email settings
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/api/email-settings', emailSettings)
      .then((response) => {
        setEmailMessage(response.data.message);
      })
      .catch((err) => {
        console.error('Error updating email settings:', err);
      });
  };

  return (
<div className="email-container">
  <h2>Email Settings</h2>
  <form onSubmit={handleEmailSubmit}>
    <div className="input-group">
      <label htmlFor="user_email">User Email:</label>
      <input
        type="email"
        name="user_email"
        id="user_email"
        value={emailSettings.user_email}
        onChange={handleEmailChange}
        required
      />
    </div>
    <div className="input-group">
      <label htmlFor="pass">Password:</label>
      <input
        type="password"
        name="pass"
        id="pass"
        value={emailSettings.pass}
        onChange={handleEmailChange}
        required
      />
    </div>
    <div className="input-group">
      <label htmlFor="from_email">From Email:</label>
      <input
        type="email"
        name="from_email"
        id="from_email"
        value={emailSettings.from_email}
        onChange={handleEmailChange}
        required
      />
    </div>
    <div className="input-group">
      <label htmlFor="to_email">To Email:</label>
      <input
        type="email"
        name="to_email"
        id="to_email"
        value={emailSettings.to_email}
        onChange={handleEmailChange}
        required
      />
    </div>
    <button type="submit" className="submit-button">Update Email Settings</button>
  </form>
  {emailMessage && <p className="email-message">{emailMessage}</p>}
</div>

  );
};

export default EmailSettings;

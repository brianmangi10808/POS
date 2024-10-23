import React, { useState } from 'react';
import EmailSettings from './EmailSettings';
import StockManagement from './StockManagement'; 
import './Category.css'

function Category() {
  // Device initialization states
  const [tin, setTin] = useState('');
  const [bhfId, setBhfId] = useState('');
  const [deviceSerialNo, setDeviceSerialNo] = useState('');
  const [message, setMessage] = useState('');

  // Device initialization submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { tin, bhfId, deviceSerialNo };

    try {
      const response = await fetch('http://localhost:3000/api/initialize-device', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error submitting form. Please try again.');
    }
  };

  return (
<div className="deviceStockEmailFull">
  <div className="deviceStockEmailGrid">
    <div className="deviceInitializationFormContainer">
      <h3 className="deviceInitializationTitle">Device Initialization</h3>
      <form onSubmit={handleSubmit} className="deviceInitializationForm">
        <div className="deviceFormGroup">
          <label htmlFor="tin" className="deviceFormLabel">TIN</label>
          <input
            type="text"
            id="tin"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
            required
            placeholder="TIN number..."
            className="deviceFormInput"
          />
        </div>
        <div className="deviceFormGroup">
          <label htmlFor="branch-number" className="deviceFormLabel">Branch Number</label>
          <input
            type="number"
            id="branch-number"
            value={bhfId}
            onChange={(e) => setBhfId(e.target.value)}
            required
            placeholder="Branch number..."
            className="deviceFormInput"
          />
        </div>
        <div className="deviceFormGroup">
          <label htmlFor="device-serial" className="deviceFormLabel">Device Serial No</label>
          <input
            type="text"
            id="device-serial"
            value={deviceSerialNo}
            onChange={(e) => setDeviceSerialNo(e.target.value)}
            required
            placeholder="Device serial number..."
            className="deviceFormInput"
          />
        </div>
        <button type="submit" className="deviceSubmitButton">Initialize Device</button>
      </form>
      {message && <p className="deviceResultsMessage">{message}</p>}
    </div>

    {/* Reuse the StockManagement and EmailSettings components */}
    <StockManagement />
    <EmailSettings />
  </div>
</div>

  );
}

export default Category;

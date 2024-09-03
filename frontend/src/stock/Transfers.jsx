import React, { useEffect, useState } from 'react';
import './Transfer.css';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

function Transfers() {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/products/details')
      .then(response => {
        setDetails(response.data); // This should now contain the data from your MySQL query
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching details:', err);
        setError('Failed to fetch details');
        setLoading(false);
      });
  }, []);
  
  return (
    <div className='transfer-container'>
      <div className="transfer-button">
        <div className="info-tb">
          <p>Create, manage and update Transfer</p>
        </div>
        <div className="transfers-btn-container">
          <NavLink to='/movement'>Transfers Stock</NavLink>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="details-table">
          <h2>Product Details</h2>
          <table>
            <thead>
              <tr>
                <th style={{border: '1px solid black', padding:'10px'}} >Product ID</th>
                <th style={{border: '1px solid black', padding:'10px'}}>Branch ID</th>
                <th style={{border: '1px solid black', padding:'10px'}}>Detail Type</th>
                <th style={{border: '1px solid black', padding:'10px'}}>Detail Description</th>
                <th style={{border: '1px solid black', padding:'10px'}}>Detail Date</th>
                
              </tr>
            </thead>
         
            <tbody>
  {details.map(detail => (
    <tr key={detail.id}>
      <td style={{border: '1px solid black', padding:'8px'}}>{detail.product_name}</td>
      <td style={{border: '1px solid black', padding:'8px'}}>{detail.branch_name}</td>
      <td style={{border: '1px solid black', padding:'8px'}}>{detail.detail_type}</td>
      <td style={{border: '1px solid black', padding:'8px'}}>{detail.detail_description}</td>
      <td style={{border: '1px solid black', padding:'8px'}}>{new Date(detail.detail_date).toLocaleDateString()}</td>
     
    </tr>
  ))}
</tbody>

           
          </table>
        </div>
      )}
    </div>
  );
}

export default Transfers;

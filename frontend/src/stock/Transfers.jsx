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
        <h2 className="details-title">Product Details</h2>
        <table className="details-table-content">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Branch ID</th>
              <th>Detail Type</th>
              <th>Detail Description</th>
              <th>Detail Date</th>
            </tr>
          </thead>
          <tbody>
            {details.map(detail => (
              <tr key={detail.id}>
                <td>{detail.product_name}</td>
                <td>{detail.branch_name}</td>
                <td>{detail.detail_type}</td>
                <td>{detail.detail_description}</td>
                <td>{new Date(detail.detail_date).toLocaleDateString()}</td>
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

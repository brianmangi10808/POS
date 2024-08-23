import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal'; 

import './sales.css';

const Sales = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to fetch transactions
    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/transaction-details');
            console.log('Transaction Data:', response.data);
            setTransactions(response.data || []);
            setFilteredTransactions(response.data || []);
        } catch (error) {
            console.error('There was an error fetching the transactions!', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchTransactions();

        // Set up polling to fetch transactions every 30 seconds
        const intervalId = setInterval(() => {
            fetchTransactions();
        }, 40000); // Adjust the interval time as needed

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [searchQuery, startDate, endDate, paymentMethod]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filterTransactions = () => {
        let tempTransactions = transactions;

        if (searchQuery) {
            tempTransactions = tempTransactions.filter(transaction => 
                transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.total_amount.toString().includes(searchQuery)
            );
        }

        if (startDate) {
            tempTransactions = tempTransactions.filter(transaction =>
                new Date(transaction.transaction_date) >= new Date(startDate)
            );
        }

        if (endDate) {
            tempTransactions = tempTransactions.filter(transaction =>
                new Date(transaction.transaction_date) <= new Date(endDate)
            );
        }

        if (paymentMethod) {
            tempTransactions = tempTransactions.filter(transaction =>
                transaction.payment_method === paymentMethod
            );
        }

        setFilteredTransactions(tempTransactions);
    };

    const handleViewClick = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    return (
        <div>
            <div className="search-filter-container">
                <input 
                    type="text" 
                    placeholder="Search by Customer Name, Amount, or Product" 
                    value={searchQuery} 
                    onChange={handleSearch} 
                />
                <div className="filter-container">
                    <input 
                        type="date" 
                        placeholder="Start Date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
                    <input 
                        type="date" 
                        placeholder="End Date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                    />
                    <select 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="">All Payment Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="MPESA">M-Pesa</option>
                        {/* Add more payment methods as needed */}
                    </select>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Amount</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(filteredTransactions) && filteredTransactions.map(transaction => (
                        <tr key={transaction.transaction_id}>
                            <td>{transaction.customer_name}</td>
                            <td>{transaction.total_amount}</td>
                            <td>{transaction.product_name}</td>
                            <td>{transaction.quantity}</td>
                            <td>
                                <button onClick={() => handleViewClick(transaction)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <h2>Transaction Details</h2>
                    <p>Customer Name: {selectedTransaction.customer_name}</p>
                    <p>Amount: {selectedTransaction.total_amount}</p>
                    <p>Product Name: {selectedTransaction.product_name}</p>
                    <p>Quantity: {selectedTransaction.quantity}</p>
                    <p>Transaction Date: {new Date(selectedTransaction.transaction_date).toLocaleString()}</p>
                    <p>Payment Method: {selectedTransaction.payment_method}</p>
                    <p>Product Description: {selectedTransaction.product_description}</p>
                </Modal>
            )}
        </div>
    );
};

export default Sales;

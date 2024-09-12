import React, { useState, useEffect } from 'react';
import { BsCreditCard } from "react-icons/bs";
import { IoReceiptOutline } from "react-icons/io5";
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Sales',
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
    }],
  });

  useEffect(() => {
    // Fetch transactions data from API
    axios.get('http://localhost:3000/api/transaction-details')
      .then(response => {
        const transactionData = response.data;

        // Filter transactions based on selected date
        const filteredTransactions = transactionData.filter(transaction => {
          const transactionDate = new Date(transaction.transaction_date).toISOString().split("T")[0];
          return transactionDate === selectedDate;
        });

        // Calculate total amount
        const totalAmount = filteredTransactions.reduce((total, transaction) => {
          return total + parseFloat(transaction.total_amount);
        }, 0);

        // Calculate total quantity
        const totalQuantity = filteredTransactions.reduce((total, transaction) => {
          return total + transaction.quantity;
        }, 0);

        setTransactions(filteredTransactions);
        setTotalAmount(totalAmount);
        setTransactionCount(filteredTransactions.length);
        setTotalQuantity(totalQuantity);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
  }, [selectedDate]); // Re-run effect when selectedDate changes

  // Handle date change
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transaction details
        const transactionResponse = await axios.get('http://localhost:3000/api/transaction-details');
        const transactions = transactionResponse.data;

        // Fetch branch details
        const branchResponse = await axios.get('http://localhost:3000/api/branches');
        const branches = branchResponse.data;

        // Initialize an object to store total amounts per branch
        const salesByBranch = {};

        // Aggregate the total amount for each branch
        transactions.forEach(transaction => {
          const branch = branches.find(branch => branch.id === transaction.branch_id);
          if (branch) {
            if (!salesByBranch[branch.name]) {
              salesByBranch[branch.name] = 0;
            }
            salesByBranch[branch.name] += parseFloat(transaction.total_amount);
          }
        });

        // Prepare data for the chart
        const branchNames = Object.keys(salesByBranch);
        const branchSales = Object.values(salesByBranch);

        // Set the chart data
        setChartData({
          labels: branchNames,
          datasets: [
            {
              label: 'Total Sales',
              data: branchSales,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
              ],
              hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
              ],
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        <div className="name-filter-date">
          <h1>Dashboard</h1>
          <input type="date" value={selectedDate} onChange={handleDateChange} /> {/* Date filter */}
        </div>
        <div className="total-day-container">
          <div className="total-day">
            <IoReceiptOutline className='large-icon' />
            <h3>Total Transactions</h3>
            <h3>{transactionCount}</h3>
          </div>
          <div className="paid-amount">
            <BsCreditCard className='large-icon' />
            <h3>Total Amount</h3>
            <h3>{totalAmount}</h3>
          </div>
          <div className="total-quantity">
            <IoReceiptOutline className='large-icon' />
            <h3>Total Quantity</h3>
            <h3>{totalQuantity}</h3>
          </div>
        </div>
        <div className="charts-container">
          <div className="chart-branch">
            <div className="chart-container">
              <h2 className="chart-title">Total Sales by Branch</h2>
              <Doughnut data={chartData} />
            </div>
          </div>
          <div className="chart-users"></div>
          <div className="chart-sales"></div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;

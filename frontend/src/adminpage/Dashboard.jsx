import React, { useState, useEffect } from 'react';
import { BsCreditCard } from "react-icons/bs";
import { IoReceiptOutline } from "react-icons/io5";
import axios from 'axios';
import { Doughnut, Bar } from 'react-chartjs-2';
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
      label: '',
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
    }],
  });

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Amount Sold',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 3,
    }],
  });

  const [branchChartData, setBranchChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Amount by Branch',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }],
  });


  const [dataType, setDataType] = useState('transactions'); // 'transactions' or 'amount'
  const [customerData, setCustomerData] = useState({}); // Store aggregated customer data

  // Function to generate distinct colors
  const generateDistinctColors = (numColors) => {
    const colors = [];
    const colorIncrement = 360 / numColors; // Divide the hue evenly across 360 degrees

    for (let i = 0; i < numColors; i++) {
      const hue = i * colorIncrement; // Ensure hues are well-spaced
      const color = `hsl(${hue}, 70%, 50%)`; // Use 70% saturation and 50% lightness for distinct colors
      colors.push(color);
    }

    return colors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transaction details
        const response = await axios.get('https://pos-backend-16dc.onrender.com/api/transaction-details');
        const transactions = response.data;

        // Aggregate data by customer
        const customerData = {};

        transactions.forEach(transaction => {
          const { customer_name, total_amount } = transaction;

          // Skip empty customer names
          if (customer_name) {
            if (!customerData[customer_name]) {
              customerData[customer_name] = { totalTransactions: 0, totalAmount: 0 };
            }
            customerData[customer_name].totalTransactions += 1;
            customerData[customer_name].totalAmount += parseFloat(total_amount);
          }
        });

        setCustomerData(customerData); // Save the aggregated data

        // Aggregate data by day of the week
        const amountsByDay = transactions.reduce((acc, transaction) => {
          const date = new Date(transaction.transaction_date);
          const day = date.toLocaleDateString('en-US', { weekday: 'long' });
          if (!acc[day]) acc[day] = 0;
          acc[day] += parseFloat(transaction.total_amount);
          return acc;
        }, {});

        // Prepare data for the bar chart
        const days = Object.keys(amountsByDay);
        const amounts = Object.values(amountsByDay);

        setBarChartData({
          labels: days,
          datasets: [
            {
              label: 'Total Amount Sold',
              data: amounts,
              backgroundColor: (context) => {
                // Create gradient for each bar
                const canvas = context.chart.canvas;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)'); // Start color
                gradient.addColorStop(1, 'rgba(75, 192, 192, 0.2)'); // End color
                return gradient;
              },
              borderColor: 'rgba(75, 192, 192, 1)', // Border color for the bars
              borderWidth: 3, // Border width
              barThickness: 50, // Thickness of bars
              borderRadius: 5, // Rounded corners for bars
            },
          ],
        });
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle filter change
  const handleDataTypeChange = (event) => {
    setDataType(event.target.value);
  };

  useEffect(() => {
    // Prepare data for the chart based on selected filter (transactions or amount)
    const customerNames = Object.keys(customerData);
    const chartValues = customerNames.map(name =>
      dataType === 'transactions'
        ? customerData[name].totalTransactions
        : customerData[name].totalAmount
    );

    const label = dataType === 'transactions' ? 'Total Transactions' : 'Total Amount';

    // Generate distinct colors
    const colors = generateDistinctColors(customerNames.length);

    // Update chart data
    setChartData({
      labels: customerNames,
      datasets: [
        {
          label,
          data: chartValues,
          backgroundColor: colors, // Distinct background colors
          hoverBackgroundColor: colors.map(color => color), // Same colors for hover
        },
      ],
    });
  }, [dataType, customerData]);

  useEffect(() => {
    // Fetch transactions data from API
    axios.get('https://pos-backend-16dc.onrender.com/api/transaction-details')
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
          <div className="chart-users">
            <div>
              <select id="data-type-select" value={dataType} onChange={handleDataTypeChange}>
                <option value="transactions">Total Transactions</option>
                <option value="amount">Total Amount</option>
              </select>
            </div>
            <div className="chart-container">
              <Doughnut
                data={chartData}
                options={{
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom', // Change to 'bottom' for horizontal alignment
                      align: 'start', // Start alignment for horizontal legend
                      labels: {
                        usePointStyle: true, // Use point style for better horizontal display
                        font: {
                          size: 17, // Set the font size for legend labels
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="chart-branch"> {/* Bar chart should be here */}
            <Bar
              data={barChartData}
              options={{
                animation: {
                  duration: 1000, // Duration of animations
                  easing: 'easeOutBounce', // Easing function for animation
                },
                responsive: true, // Make the chart responsive
                plugins: {
                  legend: {
                    display: true,
                    position: 'top', // Position of the legend
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => {
                        return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
                      },
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tooltip background color
                    titleFont: {
                      size: 17, // Font size for tooltip title
                    },
                    bodyFont: {
                      size: 17, // Font size for tooltip body
                    },
                  },
                },
              }}
              
            />
          </div>
          <div className="branch-data">
          <Bar
              data={branchChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: 'top' },
                },
                scales: {
                  x: { beginAtZero: true },
                  y: { beginAtZero: true },
                },
              }}
            />

          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
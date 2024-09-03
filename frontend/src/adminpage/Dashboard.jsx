import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const generateColors = (numColors) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const hue = Math.floor((360 / numColors) * i); // Evenly spread hues
    colors.push(`hsl(${hue}, 70%, 50%)`); // HSL color model
  }
  return colors;
};

const Dashboard = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: [],
      },
    ],
  });
  const [selectedMetric, setSelectedMetric] = useState('totalSalesAmount');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/transaction-details');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  const processData = (data, metric) => {
    let labels = [];
    let values = [];
    const aggregatedData = {};

    data.forEach((item) => {
      const name = item.customer_name || 'Unknown';

      if (!aggregatedData[name]) {
        aggregatedData[name] = {
          totalSalesAmount: 0,
          totalQuantitySold: 0,
          numberOfTransactions: 0,
        };
      }

      aggregatedData[name].totalSalesAmount += parseFloat(item.total_amount) || 0;
      aggregatedData[name].totalQuantitySold += item.quantity || 0;
      aggregatedData[name].numberOfTransactions += 1;
    });

    labels = Object.keys(aggregatedData);
    values = labels.map((name) => aggregatedData[name][metric]);

    // Generate colors based on the number of users
    const colors = generateColors(labels.length);

    setChartData({
      labels,
      datasets: [
        {
          label: metric,
          data: values,
          backgroundColor: colors,
        },
      ],
    });
    setLoading(false);
  };

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      const data = await fetchData();
      processData(data, selectedMetric);
    };

    loadChartData();
  }, [selectedMetric]);

  return (
    <div>
      <div>
        <label htmlFor="metric-select">Select Metric:</label>
        <select
          id="metric-select"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="totalSalesAmount">Total Sales Amount</option>
          <option value="totalQuantitySold">Total Quantity Sold</option>
          <option value="numberOfTransactions">Number of Transactions</option>
        </select>
      </div>
      {!loading ? (
        <div style={{ width: '300px', height: '300px' }}>
          <Pie 
            data={chartData} 
            options={{ maintainAspectRatio: false }} 
          />
        </div>
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
};

export default Dashboard;

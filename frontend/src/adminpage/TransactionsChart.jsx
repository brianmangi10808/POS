import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, CircularProgress } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TransactionsChart = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://pos-backend-16dc.onrender.com/api/transactions-per-day')
      .then((response) => {
        const data = response.data;

        const dates = data.map(item => item.transaction_day);
        const transactionCounts = data.map(item => item.total_transactions);

        setChartData({
          labels: dates,
          datasets: [{
            label: 'Transactions',
            data: transactionCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
            hoverBorderColor: 'rgba(54, 162, 235, 1)',
          }]
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
             <CircularProgress />
           </Box>;
  }

  return (
    <div>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 14,
                  family: "'Roboto', sans-serif"
                }
              }
            },
            title: {
              display: true,
              text: 'Number of Transactions Per Day',
              font: {
                size: 20,
                family: "'Roboto', sans-serif"
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 12,
                  family: "'Roboto', sans-serif"
                }
              },
              grid: {
                display: false,
              }
            },
            x: {
              ticks: {
                font: {
                  size: 12,
                  family: "'Roboto', sans-serif"
                }
              },
              grid: {
                display: false,
              }
            }
          }
        }}
      />
    </div>
  );
};

export default TransactionsChart;

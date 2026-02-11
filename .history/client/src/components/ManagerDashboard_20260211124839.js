import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { pulseAPI } from '../services/api';
import { subscribeToPulseUpdate } from '../services/socketService';
import '../styles/components.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ManagerDashboard = ({ teamId }) => {
  const [pulseData, setPulseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadPulseData = async () => {
    try {
      setLoading(true);
      const res = await pulseAPI.getAggregatedPulse(teamId);
      setPulseData(res.data);
    } catch (error) {
      console.error('Error loading pulse data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPulseData();

    // Subscribe to real-time pulse updates
    subscribeToPulseUpdate((data) => {
      loadPulseData();
      setLastUpdate(new Date());
    });
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="loading">Loading team pulse data...</div>;
  }

  if (!pulseData) {
    return <div className="empty-message">No pulse data available</div>;
  }

  const chartData = {
    labels: ['Light', 'Good', 'Heavy'],
    datasets: [
      {
        label: 'Team Wellness',
        data: [
          pulseData.percentages.Light,
          pulseData.percentages.Good,
          pulseData.percentages.Heavy,
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
        borderColor: ['#45a049', '#0b7dda', '#e68900'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  return (
    <div className="manager-dashboard">
      <h2>📊 Team Wellness Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Light</h3>
          <p className="stat-value">{pulseData.percentages.Light}%</p>
          <p className="stat-count">({pulseData.counts.Light} members)</p>
        </div>
        <div className="stat-card">
          <h3>Good</h3>
          <p className="stat-value">{pulseData.percentages.Good}%</p>
          <p className="stat-count">({pulseData.counts.Good} members)</p>
        </div>
        <div className="stat-card">
          <h3>Heavy</h3>
          <p className="stat-value">{pulseData.percentages.Heavy}%</p>
          <p className="stat-count">({pulseData.counts.Heavy} members)</p>
        </div>
      </div>

      <div className="chart-container">
        <Doughnut data={chartData} options={chartOptions} />
      </div>

      <div className="update-info">
        <p>Total Responses: {pulseData.counts.total}</p>
        {lastUpdate && (
          <p>Last Updated: {lastUpdate.toLocaleTimeString()}</p>
        )}
      </div>

      <button onClick={loadPulseData} className="btn-secondary">
        🔄 Refresh Data
      </button>
    </div>
  );
};

export default ManagerDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { connectSocket, joinRoom } from '../services/socketService';
import KudosFeed from '../components/KudosFeed';
import PulseModal from '../components/PulseModal';
import ManagerDashboard from '../components/ManagerDashboard';
import QAComponent from '../components/QAComponent';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [activeTab, setActiveTab] = useState('kudos');

  useEffect(() => {
    if (user && token) {
      connectSocket(token, user.id);

      if (user.teamId) {
        setSelectedTeam(user.teamId);
        const roomType =
          user.role === 'Manager' ? 'manager-dashboard' : 'company-feed';
        joinRoom(user.id, user.teamId, roomType);
      }
    }
  }, [user, token]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🎯 Atmos Dashboard</h1>
        <div className="header-info">
          <span className="user-name">Welcome, {user.name}</span>
          <span className="user-role">{user.role}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={`nav-button ${activeTab === 'kudos' ? 'active' : ''}`}
            onClick={() => setActiveTab('kudos')}
          >
            Kudos Feed
          </button>
          <button
            className={`nav-button ${activeTab === 'pulse' ? 'active' : ''}`}
            onClick={() => setActiveTab('pulse')}
          >
            Pulse Check
          </button>
          {user.role === 'Manager' && (
            <button
              className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Team Dashboard
            </button>
          )}
          <button
            className={`nav-button ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            Q&A
          </button>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'kudos' && selectedTeam && (
            <KudosFeed teamId={selectedTeam} userId={user.id} />
          )}
          {activeTab === 'pulse' && (
            <div className="pulse-section">
              <h2>How are you feeling?</h2>
              <button
                onClick={() => setShowPulseModal(true)}
                className="btn-primary"
              >
                Take Pulse Check
              </button>
              {showPulseModal && (
                <PulseModal
                  onClose={() => setShowPulseModal(false)}
                  teamId={selectedTeam}
                />
              )}
            </div>
          )}
          {activeTab === 'dashboard' && user.role === 'Manager' && selectedTeam && (
            <ManagerDashboard teamId={selectedTeam} />
          )}
          {activeTab === 'qa' && selectedTeam && (
            <QAComponent teamId={selectedTeam} userId={user.id} userRole={user.role} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

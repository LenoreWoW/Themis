import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to the Themis Project Management System dashboard!</p>
      
      <div className="dashboard-section">
        <h2>Summary</h2>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Projects</h3>
            <div className="stat-value">5</div>
          </div>
          <div className="stat-card">
            <h3>Tasks</h3>
            <div className="stat-value">23</div>
          </div>
          <div className="stat-card">
            <h3>Users</h3>
            <div className="stat-value">12</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <p>No recent activity to display.</p>
      </div>
    </div>
  );
};

export default Dashboard; 
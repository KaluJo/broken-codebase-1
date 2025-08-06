import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ActivityLog = ({ userId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  const location = useLocation();

  const fetchUserLogs = async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          logs: [
            { id: 1, action: 'login', timestamp: '2024-01-15 10:30:00', userId },
            { id: 2, action: 'view_profile', timestamp: '2024-01-15 10:31:00', userId },
            { id: 3, action: 'update_settings', timestamp: '2024-01-15 10:35:00', userId },
          ],
          total: 3
        });
      }, 500);
    });
  };

  const fetchUserDetails = async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: userId, name: `User ${userId}`, email: `user${userId}@example.com` });
      }, 300);
    });
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      setError(null);
      
      Promise.all([
        fetchUserDetails(userId),
        fetchUserLogs(userId)
      ]).then(([userDetails, logsData]) => {
        setUser(userDetails);
        setLogs(logsData.logs);
        setLoading(false);
      }).catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="activity-log">
      <h3>Activity Log for {user?.name || `User ${userId}`}</h3>
      
      <div className="log-entries">
        {logs.map(log => (
          <div key={log.id} className="log-entry">
            <span className="timestamp">{log.timestamp}</span>
            <span className="action">{log.action}</span>
            <span className="user">User {log.userId}</span>
          </div>
        ))}
      </div>
      
      {logs.length === 0 && !loading && (
        <div className="no-logs">
          <p>No activity logs found for this user.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog; 
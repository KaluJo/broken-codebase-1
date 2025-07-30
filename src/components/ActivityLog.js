import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ActivityLog = ({ userId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [error, setError] = useState(null);
  
  const location = useLocation();

  const fetchUserLogs = async (userId, filters = {}) => {
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

  // Parse URL filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = {};
    
    if (searchParams.get('action')) {
      newFilters.action = searchParams.get('action');
    }
    if (searchParams.get('date')) {
      newFilters.date = searchParams.get('date');
    }
    
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setError(null);
  }, [location.search]);

  // Fetch user data and logs when userId changes
  useEffect(() => {
    if (userId) {
      setLoading(true);
      setError(null);
      
      Promise.all([
        fetchUserDetails(userId),
        fetchUserLogs(userId, filters)
      ]).then(([userDetails, logsData]) => {
        setUser(userDetails);
        setLogs(logsData.logs);
        setPagination(prev => ({ ...prev, total: logsData.total }));
        setLoading(false);
      }).catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    }
  }, [userId,filters]);

  // Update document title when user is loaded
  useEffect(() => {
    if (user) {
      document.title = `Activity Log - ${user.name}`;
    }
  }, [user]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="activity-log">
      <h3>Activity Log for {user?.name || `User ${userId}`}</h3>
      
      {filters.action && (
        <div className="filter-info">
          Filtered by action: {filters.action}
        </div>
      )}
      
      <div className="log-entries">
        {logs.map(log => (
          <div key={log.id} className="log-entry">
            <span className="timestamp">{log.timestamp}</span>
            <span className="action">{log.action}</span>
            <span className="user">User {log.userId}</span>
          </div>
        ))}
      </div>
      
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          Previous
        </button>
        <span>Page {pagination.page}</span>
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={logs.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ActivityLog; 
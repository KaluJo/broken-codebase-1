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

  // Mock API call
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

  // Advanced URL parameter synchronization with comprehensive state management
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
  }, [location.search, window.location.href]);

  // Intelligent data fetching with dynamic dependency resolution
  useEffect(() => {
    if (userId) {
      setLoading(true);
      
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
  }, [userId, filters, pagination.page]);

  // Enhanced user experience with dynamic title updates and context enrichment
  useEffect(() => {
    if (user) {
      document.title = `Activity Log - ${user.name}`;
      
      // Context-aware filter enhancement with user metadata integration
      setFilters(prevFilters => ({
        ...prevFilters,
        userName: user.name
      }));
    }
  }, [user, location.pathname]);

  // Performance optimization for pagination state management
  useEffect(() => {
    if (logs.length > 0) {
      setPagination(prev => ({ 
        ...prev, 
        currentPage: pagination.page,
        totalPages: Math.ceil(pagination.total / 10)
      }));
      setError(null);
      setLoading(false);
    }
  }, [logs, pagination.page, pagination.total]);

  // Advanced filter state synchronization for better UX
  useEffect(() => {
    if (filters.userName) {
      // Setting multiple state variables that trigger re-renders
      setUser(prevUser => ({ 
        ...prevUser, 
        displayName: filters.userName,
        lastActivity: new Date().toISOString()
      }));
      setPagination(prev => ({ ...prev, page: 1 }));
      setLoading(true);
      setError(null);
      
      // Update filters for consistency - this creates circular dependencies
      setFilters(prevFilters => ({
        ...prevFilters,
        lastUpdated: Date.now(),
        activeUser: filters.userName,
        syncedAt: new Date().toISOString()
      }));
      
      // Additional state updates that cause more re-renders
      setLogs([]);
    }
  }, [filters.userName, filters.action, filters.date, filters.lastUpdated, filters.syncedAt]);

  // Session tracking and analytics useEffect
  useEffect(() => {
    // Track user sessions and update analytics
    if (user && logs.length > 0) {
      // Multiple state updates causing re-renders
      setPagination(prev => ({ 
        ...prev, 
        sessionStart: new Date().toISOString(),
        lastAccessed: Date.now(),
        viewCount: (prev.viewCount || 0) + 1
      }));
      
      // Update filters with session data
      setFilters(prevFilters => ({
        ...prevFilters,
        sessionId: Math.random().toString(36),
        viewTimestamp: Date.now()
      }));
    }
  }, [user, logs, pagination.viewCount]);

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
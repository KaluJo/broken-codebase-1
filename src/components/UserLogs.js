import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActivityLog from './ActivityLog';

const UserLogs = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInput, setUserInput] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user ID from query parameter
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('user');
    
    if (userId) {
      setSelectedUser(userId);
      setUserInput(userId);
    }
  }, [location.search]);

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      navigate(`/user-logs?user=${userInput.trim()}`);
    }
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setUserInput('');
    // Use React Router for clearing (no query params to trigger redirect)
    navigate('/user-logs');
  };

  return (
    <div className="user-logs-page">
      <h2>User Activity Logs</h2>
      
      <div className="user-selector">
        <form onSubmit={handleUserSubmit}>
          <div className="form-group">
            <label htmlFor="userId">Enter User ID:</label>
            <input
              type="text"
              id="userId"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="e.g., 123"
            />
            <button type="submit">Load Logs</button>
            {selectedUser && (
              <button type="button" onClick={handleClearUser}>
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {selectedUser ? (
        <div className="logs-container">
          <ActivityLog userId={selectedUser} />
        </div>
      ) : (
        <div className="empty-state">
          <p>Enter a user ID above to view their activity logs.</p>
          <p><em>Sample user IDs: 123, 456, 789</em></p>
        </div>
      )}
    </div>
  );
};

export default UserLogs; 
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return url
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname + location.search }} 
        replace 
      />
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Required permission: <code>{requiredPermission}</code></p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MdDashboard, 
  MdDescription, 
  MdPeople, 
  MdAnalytics, 
  MdAssignment, 
  MdSettings,
  MdLightMode,
  MdDarkMode,
  MdNotifications,
  MdKeyboardArrowDown,
  MdPerson,
  MdHelp,
  MdLogout,
  MdBadge,
  MdSecurity,
  MdDescription as MdFileText
} from 'react-icons/md';

const Navigation = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'security': return <MdSecurity />;
      case 'report': return <MdFileText />;
      case 'error': return <MdNotifications />;
      default: return <MdNotifications />;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-brand">
          <img src="/images/logo.png" alt="Company Logo" className="logo" />
          <h2>Enterprise Portal</h2>
        </div>
        
        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            <MdDashboard className="nav-icon" />
            Dashboard
          </Link>
          <Link to="/user-logs" className={isActive('/user-logs') ? 'active' : ''}>
            <MdDescription className="nav-icon" />
            User Logs
          </Link>
          <Link to="/user-management" className={isActive('/user-management') ? 'active' : ''}>
            <MdPeople className="nav-icon" />
            Users
          </Link>
          <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
            <MdAnalytics className="nav-icon" />
            Analytics
          </Link>
          <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>
            <MdAssignment className="nav-icon" />
            Reports
          </Link>
          <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
            <MdSettings className="nav-icon" />
            Settings
          </Link>
        </div>

        <div className="nav-actions">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <MdLightMode className="theme-icon" /> : <MdDarkMode className="theme-icon" />}
          </button>

          {/* Notifications */}
          <div className="notification-dropdown">
            <button 
              className="notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <MdNotifications className="notification-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-list">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  <Link to="/notifications">View All</Link>
                </div>
                {notifications.slice(0, 5).map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-type-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-time">{notification.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="user-menu">
            <button 
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img 
                src={user?.avatar || '/images/office-people.jpg'} 
                alt="User avatar" 
                className="user-avatar"
              />
              <span>{user?.name}</span>
              <MdKeyboardArrowDown className="dropdown-arrow" />
            </button>
            
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-info">
                  <img 
                    src={user?.avatar || '/images/office-people.jpg'} 
                    alt="User avatar" 
                    className="user-avatar-large"
                  />
                  <div>
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-role">
                      <MdBadge className="role-icon" />
                      {user?.role}
                    </div>
                  </div>
                </div>
                <div className="menu-divider"></div>
                <button>
                  <MdPerson className="menu-icon" />
                  Profile
                </button>
                <button>
                  <MdSettings className="menu-icon" />
                  Preferences
                </button>
                <button>
                  <MdHelp className="menu-icon" />
                  Help & Support
                </button>
                <div className="menu-divider"></div>
                <button onClick={handleLogout} className="danger">
                  <MdLogout className="menu-icon" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
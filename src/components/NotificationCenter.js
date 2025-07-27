import React, { useState, useEffect, useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDistanceToNow } from '../utils/dateUtils';
import { debounce } from '../utils/performanceUtils';

const NotificationCenter = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState([]);

  const { 
    notifications: contextNotifications, 
    systemAlerts,
    markAsRead,
    markAllRead,
    clearAllNotifications,
    removeNotification,
  } = useNotifications();
  
  const { user } = useAuth();
  const notificationsPerPage = 20;

  // Mock additional notification history
  const mockNotificationHistory = [
    {
      id: 'hist_1',
      type: 'system',
      level: 'info',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance window: Jan 20, 2024 2:00 AM - 4:00 AM UTC',
      timestamp: '2024-01-15T10:00:00Z',
      read: true,
      category: 'maintenance',
      priority: 'medium',
    },
    {
      id: 'hist_2',
      type: 'security',
      level: 'warning',
      title: 'New Login Detected',
      message: 'New login from Chrome on Windows (IP: 192.168.1.105)',
      timestamp: '2024-01-15T09:30:00Z',
      read: true,
      category: 'security',
      priority: 'high',
    },
    {
      id: 'hist_3',
      type: 'billing',
      level: 'success',
      title: 'Payment Successful',
      message: 'Your monthly subscription payment has been processed successfully.',
      timestamp: '2024-01-15T08:15:00Z',
      read: true,
      category: 'billing',
      priority: 'low',
    },
    {
      id: 'hist_4',
      type: 'feature',
      level: 'info',
      title: 'New Feature Available',
      message: 'Advanced analytics dashboard is now available for Enterprise users.',
      timestamp: '2024-01-14T16:45:00Z',
      read: false,
      category: 'product',
      priority: 'medium',
    },
    {
      id: 'hist_5',
      type: 'system',
      level: 'error',
      title: 'Database Connection Issues',
      message: 'Temporary database connectivity issues resolved. No data loss occurred.',
      timestamp: '2024-01-14T14:20:00Z',
      read: true,
      category: 'system',
      priority: 'high',
    },
  ];

  useEffect(() => {
    const loadNotificationHistory = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Combine current notifications with history
        const combinedNotifications = [
          ...contextNotifications.map(n => ({
            ...n,
            category: 'toast',
            priority: n.level === 'error' ? 'high' : n.level === 'warning' ? 'medium' : 'low',
            title: n.title || `${n.level.charAt(0).toUpperCase() + n.level.slice(1)} Notification`,
          })),
          ...systemAlerts.map(a => ({
            ...a,
            level: a.severity === 'high' ? 'error' : a.severity === 'medium' ? 'warning' : 'info',
            category: 'system_alert',
            priority: a.severity,
            read: false,
          })),
          ...mockNotificationHistory,
        ];

        setAllNotifications(combinedNotifications);
      } catch (error) {
        console.error('Failed to load notification history');
      } finally {
        setLoading(false);
      }
    };

    loadNotificationHistory();
  }, [contextNotifications, systemAlerts]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(() => setCurrentPage(1), 300),
    []
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(notification => {
      const matchesSearch = 
        notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'read' && notification.read) ||
        (statusFilter === 'unread' && !notification.read);
      
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [allNotifications, searchTerm, typeFilter, statusFilter]);

  // Pagination
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * notificationsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + notificationsPerPage);
  }, [filteredNotifications, currentPage]);

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'neutral';
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { class: 'danger', label: 'High' },
      medium: { class: 'warning', label: 'Medium' },
      low: { class: 'success', label: 'Low' },
    };
    
    const config = priorityConfig[priority] || priorityConfig.low;
    
    return (
      <span className={`priority-badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return '🔒';
      case 'billing': return '💳';
      case 'system': return '⚙️';
      case 'maintenance': return '🔧';
      case 'product': return '🚀';
      case 'system_alert': return '🚨';
      case 'toast': return '💬';
      default: return '📋';
    }
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    setAllNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    markAllRead();
    setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notificationId) => {
    removeNotification(notificationId);
    setAllNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="page-header">
        <h2>Notification Center</h2>
        <div className="page-actions">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
              ✓ Mark All Read ({unreadCount})
            </button>
          )}
          <button onClick={clearAllNotifications} className="btn btn-danger-outline">
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="notification-stats">
        <div className="stat-card">
          <h4>Total Notifications</h4>
          <div className="stat-value">{filteredNotifications.length}</div>
        </div>
        <div className="stat-card">
          <h4>Unread</h4>
          <div className="stat-value unread">{unreadCount}</div>
        </div>
        <div className="stat-card">
          <h4>High Priority</h4>
          <div className="stat-value high-priority">
            {filteredNotifications.filter(n => n.priority === 'high').length}
          </div>
        </div>
        <div className="stat-card">
          <h4>Today</h4>
          <div className="stat-value">
            {filteredNotifications.filter(n => {
              const today = new Date();
              const notifDate = new Date(n.timestamp);
              return notifDate.toDateString() === today.toDateString();
            }).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="system">System</option>
            <option value="security">Security</option>
            <option value="billing">Billing</option>
            <option value="feature">Features</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Results info */}
      <div className="results-info">
        <p>
          Showing {paginatedNotifications.length} of {filteredNotifications.length} notifications
          (Page {currentPage} of {totalPages})
        </p>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {paginatedNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.read ? 'read' : 'unread'} ${getLevelColor(notification.level)}`}
          >
            <div className="notification-content">
              <div className="notification-header">
                <div className="notification-meta">
                  <span className="level-icon">{getLevelIcon(notification.level)}</span>
                  <span className="category-icon">{getCategoryIcon(notification.category)}</span>
                  <h4 className="notification-title">{notification.title}</h4>
                  {getPriorityBadge(notification.priority)}
                </div>
                <div className="notification-time">
                  <span className="timestamp">{formatDate(notification.timestamp, 'Pp')}</span>
                  <span className="time-ago">{formatDistanceToNow(notification.timestamp)}</span>
                </div>
              </div>

              <div className="notification-message">
                {notification.message}
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="btn btn-sm btn-outline"
                  >
                    ✓ Mark Read
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="btn btn-sm btn-danger-outline"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            {!notification.read && <div className="unread-indicator"></div>}
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No notifications found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ⏮️ First
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Last ⏭️
          </button>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="notification-preferences">
        <h3>Notification Preferences</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Email notifications for high priority alerts
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Browser notifications for system alerts
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input type="checkbox" />
              SMS notifications for security events
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input type="checkbox" defaultChecked />
              Weekly digest emails
            </label>
          </div>
        </div>
        <button className="btn btn-primary">Save Preferences</button>
      </div>
    </div>
  );
};

export default NotificationCenter; 
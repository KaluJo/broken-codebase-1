import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDate, formatDistanceToNow, getDateRanges } from '../utils/dateUtils';
import { debounce } from '../utils/performanceUtils';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last7Days');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { hasPermission, user } = useAuth();
  const { showError } = useNotifications();

  const logsPerPage = 50;

  // Mock audit logs data
  const mockLogs = [
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      userId: '1',
      userName: 'Admin User',
      action: 'user.created',
      resource: 'User',
      resourceId: '123',
      details: {
        email: 'newuser@example.com',
        role: 'user',
        created_by: 'admin@example.com'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      severity: 'info',
      outcome: 'success',
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:00Z',
      userId: '2',
      userName: 'Manager User',
      action: 'user.password_reset',
      resource: 'User',
      resourceId: '456',
      details: {
        email: 'user@example.com',
        reset_method: 'email',
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'warning',
      outcome: 'success',
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:00Z',
      userId: '1',
      userName: 'Admin User',
      action: 'settings.updated',
      resource: 'SystemSettings',
      resourceId: 'global',
      details: {
        setting: 'max_login_attempts',
        old_value: '3',
        new_value: '5',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      severity: 'info',
      outcome: 'success',
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:15:00Z',
      userId: '999',
      userName: 'Unknown User',
      action: 'auth.login_failed',
      resource: 'Authentication',
      resourceId: null,
      details: {
        email: 'attacker@badsite.com',
        reason: 'invalid_credentials',
        attempt_number: 5,
      },
      ipAddress: '203.0.113.195',
      userAgent: 'Python-urllib/3.8',
      severity: 'error',
      outcome: 'failure',
    },
    {
      id: '5',
      timestamp: '2024-01-15T14:10:00Z',
      userId: '2',
      userName: 'Manager User',
      action: 'report.generated',
      resource: 'Report',
      resourceId: 'monthly_001',
      details: {
        report_type: 'monthly_summary',
        format: 'PDF',
        recipients: ['admin@example.com', 'manager@example.com'],
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'info',
      outcome: 'success',
    },
    {
      id: '6',
      timestamp: '2024-01-15T14:05:00Z',
      userId: '1',
      userName: 'Admin User',
      action: 'data.exported',
      resource: 'UserData',
      resourceId: 'bulk_export_001',
      details: {
        export_type: 'user_activity',
        date_range: '2024-01-01 to 2024-01-15',
        record_count: 15284,
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      severity: 'warning',
      outcome: 'success',
    },
  ];

  const actionTypes = [
    'user.created', 'user.updated', 'user.deleted', 'user.password_reset',
    'auth.login', 'auth.logout', 'auth.login_failed',
    'settings.updated', 'settings.viewed',
    'report.generated', 'report.viewed', 'report.downloaded',
    'data.exported', 'data.imported', 'data.deleted',
    'system.backup', 'system.restore', 'system.maintenance',
  ];

  // Simulate API call
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate more logs with timestamps
        const additionalLogs = Array.from({ length: 50 }, (_, index) => ({
          id: `${mockLogs.length + index + 1}`,
          timestamp: new Date(Date.now() - (index + 6) * 5 * 60 * 1000).toISOString(),
          userId: ['1', '2', '3'][Math.floor(Math.random() * 3)],
          userName: ['Admin User', 'Manager User', 'Regular User'][Math.floor(Math.random() * 3)],
          action: actionTypes[Math.floor(Math.random() * actionTypes.length)],
          resource: ['User', 'Report', 'Settings', 'System'][Math.floor(Math.random() * 4)],
          resourceId: Math.random().toString(36).substr(2, 9),
          details: { operation: 'automated_action', value: Math.floor(Math.random() * 1000) },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Generic Browser)',
          severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
          outcome: Math.random() > 0.1 ? 'success' : 'failure',
        }));
        
        setLogs([...mockLogs, ...additionalLogs]);
      } catch (error) {
        showError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [showError]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(() => setCurrentPage(1), 300),
    []
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesUser = userFilter === 'all' || log.userId === userFilter;
      
      // Date range filtering
      const dateRanges = getDateRanges();
      const range = dateRanges[dateRange];
      if (range) {
        const logDate = new Date(log.timestamp);
        const matchesDate = logDate >= range.start && logDate <= range.end;
        if (!matchesDate) return false;
      }
      
      return matchesSearch && matchesAction && matchesUser;
    });

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs, searchTerm, actionFilter, userFilter, dateRange]);

  // Pagination
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚫';
    }
  };

  const getOutcomeIcon = (outcome) => {
    return outcome === 'success' ? '✅' : '❌';
  };

  const exportLogs = async () => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      const csvContent = filteredLogs.map(log => 
        `${log.timestamp},${log.userName},${log.action},${log.resource},${log.outcome},${log.ipAddress}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError('Export failed');
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view audit logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-logs">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <div className="page-actions">
          <button onClick={exportLogs} className="btn btn-secondary">
            📄 Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search logs by action, user, resource, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="1">Admin User</option>
            <option value="2">Manager User</option>
            <option value="3">Regular User</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7Days">Last 7 days</option>
            <option value="last30Days">Last 30 days</option>
            <option value="lastWeek">Last week</option>
            <option value="lastMonth">Last month</option>
          </select>
        </div>
      </div>

      {/* Results info */}
      <div className="results-info">
        <p>
          Showing {paginatedLogs.length} of {filteredLogs.length} logs
          (Page {currentPage} of {totalPages})
        </p>
      </div>

      {/* Logs table */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Outcome</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr key={log.id} className={`log-row ${log.severity}`}>
                <td>
                  <div className="timestamp-cell">
                    <span className="severity-icon">{getSeverityIcon(log.severity)}</span>
                    <div>
                      <div className="timestamp">{formatDate(log.timestamp, 'Pp')}</div>
                      <div className="time-ago">{formatDistanceToNow(log.timestamp)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="user-cell">
                    <strong>{log.userName}</strong>
                    <div className="user-id">ID: {log.userId}</div>
                  </div>
                </td>
                <td>
                  <span className="action-badge">{log.action}</span>
                </td>
                <td>
                  <div className="resource-cell">
                    <strong>{log.resource}</strong>
                    {log.resourceId && (
                      <div className="resource-id">{log.resourceId}</div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`outcome-badge ${log.outcome}`}>
                    {getOutcomeIcon(log.outcome)} {log.outcome}
                  </span>
                </td>
                <td>
                  <div className="ip-cell">
                    <div>{log.ipAddress}</div>
                    <div className="user-agent">{log.userAgent.substring(0, 30)}...</div>
                  </div>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowDetails(true);
                    }}
                  >
                    👁️ View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Audit Log Details</h3>
              <button onClick={() => setShowDetails(false)} className="modal-close">
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="log-details">
                <div className="detail-group">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div><strong>ID:</strong> {selectedLog.id}</div>
                    <div><strong>Timestamp:</strong> {formatDate(selectedLog.timestamp, 'PPPp')}</div>
                    <div><strong>User:</strong> {selectedLog.userName} (ID: {selectedLog.userId})</div>
                    <div><strong>Action:</strong> {selectedLog.action}</div>
                    <div><strong>Resource:</strong> {selectedLog.resource}</div>
                    <div><strong>Resource ID:</strong> {selectedLog.resourceId || 'N/A'}</div>
                    <div><strong>Outcome:</strong> {selectedLog.outcome}</div>
                    <div><strong>Severity:</strong> {selectedLog.severity}</div>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Network Information</h4>
                  <div className="detail-grid">
                    <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                    <div><strong>User Agent:</strong> {selectedLog.userAgent}</div>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Additional Details</h4>
                  <pre className="details-json">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="audit-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Actions:</span>
            <span className="stat-value">{filteredLogs.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Success Rate:</span>
            <span className="stat-value">
              {((filteredLogs.filter(l => l.outcome === 'success').length / filteredLogs.length) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique Users:</span>
            <span className="stat-value">
              {new Set(filteredLogs.map(l => l.userId)).size}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unique IPs:</span>
            <span className="stat-value">
              {new Set(filteredLogs.map(l => l.ipAddress)).size}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs; 
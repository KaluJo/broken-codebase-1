import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from '../utils/dateUtils';

const SystemHealth = () => {
  const [systemData, setSystemData] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const { hasPermission } = useAuth();
  const { showError, addSystemAlert } = useNotifications();

  // Mock system health data
  const generateMockData = useCallback(() => {
    const now = new Date();
    
    return {
      overview: {
        status: Math.random() > 0.1 ? 'healthy' : 'degraded',
        uptime: '15d 8h 42m',
        lastUpdate: now.toISOString(),
      },
      services: [
        {
          name: 'API Gateway',
          status: Math.random() > 0.05 ? 'healthy' : 'unhealthy',
          uptime: 99.8,
          responseTime: Math.floor(Math.random() * 50) + 20,
          lastCheck: now.toISOString(),
          url: 'https://api.example.com',
        },
        {
          name: 'Database',
          status: Math.random() > 0.02 ? 'healthy' : 'degraded',
          uptime: 99.95,
          responseTime: Math.floor(Math.random() * 30) + 5,
          lastCheck: now.toISOString(),
          url: 'postgresql://db.example.com:5432',
        },
        {
          name: 'Redis Cache',
          status: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
          uptime: 99.7,
          responseTime: Math.floor(Math.random() * 10) + 1,
          lastCheck: now.toISOString(),
          url: 'redis://cache.example.com:6379',
        },
        {
          name: 'File Storage',
          status: Math.random() > 0.05 ? 'healthy' : 'degraded',
          uptime: 99.9,
          responseTime: Math.floor(Math.random() * 100) + 50,
          lastCheck: now.toISOString(),
          url: 's3://files.example.com',
        },
        {
          name: 'Email Service',
          status: Math.random() > 0.08 ? 'healthy' : 'unhealthy',
          uptime: 99.5,
          responseTime: Math.floor(Math.random() * 200) + 100,
          lastCheck: now.toISOString(),
          url: 'smtp://mail.example.com:587',
        },
      ],
      metrics: {
        cpu: {
          usage: Math.floor(Math.random() * 40) + 20,
          cores: 8,
          load: (Math.random() * 2 + 0.5).toFixed(2),
        },
        memory: {
          used: Math.floor(Math.random() * 30) + 40,
          total: 32768, // MB
          available: Math.floor(Math.random() * 20) + 50,
        },
        disk: {
          used: Math.floor(Math.random() * 20) + 60,
          total: 1000, // GB
          available: Math.floor(Math.random() * 30) + 20,
        },
        network: {
          inbound: (Math.random() * 100 + 50).toFixed(1),
          outbound: (Math.random() * 80 + 30).toFixed(1),
          connections: Math.floor(Math.random() * 500) + 1000,
        },
      },
      alerts: [
        {
          id: '1',
          severity: 'warning',
          message: 'High memory usage detected on server-02',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: '2',
          severity: 'info',
          message: 'Database backup completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
        {
          id: '3',
          severity: 'error',
          message: 'SSL certificate expires in 7 days',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
      ],
      incidents: [
        {
          id: '1',
          title: 'Database Connection Timeout',
          status: 'resolved',
          severity: 'high',
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          duration: '1h 12m',
        },
        {
          id: '2',
          title: 'API Rate Limiting Issues',
          status: 'investigating',
          severity: 'medium',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          endTime: null,
          duration: null,
        },
      ],
    };
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateMockData();
      
      // Check for critical alerts
      const criticalAlerts = data.alerts.filter(alert => 
        alert.severity === 'error' && !alert.resolved
      );
      
      criticalAlerts.forEach(alert => {
        addSystemAlert({
          severity: 'high',
          title: 'System Alert',
          message: alert.message,
          type: 'system_health',
        });
      });
      
      setSystemData(data);
    } catch (error) {
      showError('Failed to fetch system health data');
    } finally {
      setLoading(false);
    }
  }, [generateMockData, showError, addSystemAlert]);

  // Initial load
  useEffect(() => {
    fetchSystemHealth();
  }, [fetchSystemHealth]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSystemHealth();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSystemHealth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'danger';
      default: return 'neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'neutral';
    }
  };

  const formatBytes = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!hasPermission('system:read')) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view system health.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-health">
      <div className="page-header">
        <h2>System Health</h2>
        <div className="page-controls">
          <div className="refresh-controls">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          <button onClick={fetchSystemHealth} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="system-overview">
        <div className={`status-banner ${getStatusColor(systemData.overview?.status)}`}>
          <div className="status-info">
            <span className="status-icon">
              {getStatusIcon(systemData.overview?.status)}
            </span>
            <div className="status-text">
              <h3>System Status: {systemData.overview?.status?.toUpperCase()}</h3>
              <p>Uptime: {systemData.overview?.uptime}</p>
              <p>Last updated: {formatDistanceToNow(systemData.overview?.lastUpdate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="services-section">
        <h3>Services</h3>
        <div className="services-grid">
          {systemData.services?.map((service, index) => (
            <div key={index} className={`service-card ${getStatusColor(service.status)}`}>
              <div className="service-header">
                <span className="service-icon">{getStatusIcon(service.status)}</span>
                <h4>{service.name}</h4>
              </div>
              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-label">Uptime</span>
                  <span className="metric-value">{service.uptime}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Response</span>
                  <span className="metric-value">{service.responseTime}ms</span>
                </div>
                <div className="service-url">{service.url}</div>
                <div className="service-updated">
                  Updated {formatDistanceToNow(service.lastCheck)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="metrics-section">
        <h3>System Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>CPU Usage</h4>
            <div className="metric-chart">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${systemData.metrics?.cpu?.usage}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>{systemData.metrics?.cpu?.usage}%</span>
                <span>Load: {systemData.metrics?.cpu?.load}</span>
                <span>{systemData.metrics?.cpu?.cores} cores</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Memory Usage</h4>
            <div className="metric-chart">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${systemData.metrics?.memory?.used}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>{systemData.metrics?.memory?.used}%</span>
                <span>{formatBytes(systemData.metrics?.memory?.total * 1024 * 1024)} total</span>
                <span>{systemData.metrics?.memory?.available}% available</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Disk Usage</h4>
            <div className="metric-chart">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${systemData.metrics?.disk?.used}%` }}
                ></div>
              </div>
              <div className="metric-details">
                <span>{systemData.metrics?.disk?.used}%</span>
                <span>{systemData.metrics?.disk?.total} GB total</span>
                <span>{systemData.metrics?.disk?.available}% available</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <h4>Network Activity</h4>
            <div className="metric-details network-details">
              <div>
                <span>Inbound: {systemData.metrics?.network?.inbound} MB/s</span>
              </div>
              <div>
                <span>Outbound: {systemData.metrics?.network?.outbound} MB/s</span>
              </div>
              <div>
                <span>Connections: {systemData.metrics?.network?.connections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="alerts-section">
        <h3>Recent Alerts</h3>
        <div className="alerts-list">
          {systemData.alerts?.map((alert) => (
            <div key={alert.id} className={`alert-item ${getSeverityColor(alert.severity)} ${alert.resolved ? 'resolved' : ''}`}>
              <div className="alert-content">
                <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{formatDistanceToNow(alert.timestamp)}</span>
              </div>
              {alert.resolved && <span className="alert-resolved">✓ Resolved</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="incidents-section">
        <h3>Recent Incidents</h3>
        <div className="incidents-list">
          {systemData.incidents?.map((incident) => (
            <div key={incident.id} className="incident-item">
              <div className="incident-header">
                <h4>{incident.title}</h4>
                <span className={`incident-status ${incident.status}`}>
                  {incident.status}
                </span>
              </div>
              <div className="incident-details">
                <span className="incident-severity">Severity: {incident.severity}</span>
                <span className="incident-time">
                  Started: {formatDistanceToNow(incident.startTime)}
                </span>
                {incident.duration && (
                  <span className="incident-duration">Duration: {incident.duration}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth; 
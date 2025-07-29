import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDate, formatDistanceToNow } from '../utils/dateUtils';
import { debounce } from '../utils/performanceUtils';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotifications();

  // Reports data
  const mockReports = [
    {
      id: '1',
      name: 'Monthly User Activity Report',
      type: 'user_activity',
      status: 'completed',
      createdAt: '2024-01-15T09:00:00Z',
      completedAt: '2024-01-15T09:15:00Z',
      size: '2.3 MB',
      format: 'PDF',
      schedule: 'monthly',
      nextRun: '2024-02-15T09:00:00Z',
      description: 'Comprehensive analysis of user engagement and activity patterns',
    },
    {
      id: '2',
      name: 'Weekly System Performance',
      type: 'system_performance',
      status: 'running',
      createdAt: '2024-01-14T08:30:00Z',
      completedAt: null,
      size: null,
      format: 'CSV',
      schedule: 'weekly',
      nextRun: '2024-01-21T08:30:00Z',
      description: 'System metrics, uptime, and performance indicators',
    },
    {
      id: '3',
      name: 'Revenue Analytics Q1',
      type: 'revenue',
      status: 'failed',
      createdAt: '2024-01-13T14:20:00Z',
      completedAt: null,
      size: null,
      format: 'Excel',
      schedule: 'quarterly',
      nextRun: '2024-04-13T14:20:00Z',
      description: 'Quarterly revenue breakdown and financial analysis',
    },
    {
      id: '4',
      name: 'Security Audit Report',
      type: 'security',
      status: 'scheduled',
      createdAt: '2024-01-12T16:45:00Z',
      completedAt: null,
      size: null,
      format: 'PDF',
      schedule: 'manual',
      nextRun: '2024-01-16T09:00:00Z',
      description: 'Security vulnerabilities and compliance status',
    },
    {
      id: '5',
      name: 'Daily Traffic Summary',
      type: 'traffic',
      status: 'completed',
      createdAt: '2024-01-11T23:00:00Z',
      completedAt: '2024-01-11T23:05:00Z',
      size: '850 KB',
      format: 'JSON',
      schedule: 'daily',
      nextRun: '2024-01-12T23:00:00Z',
      description: 'Website traffic patterns and visitor analytics',
    },
  ];

  const reportTypes = [
    { value: 'user_activity', label: 'User Activity', icon: '👤' },
    { value: 'system_performance', label: 'System Performance', icon: '⚡' },
    { value: 'revenue', label: 'Revenue Analytics', icon: '💰' },
    { value: 'security', label: 'Security Audit', icon: '🔒' },
    { value: 'traffic', label: 'Traffic Analysis', icon: '🌐' },
  ];

  const scheduleOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  // Simulate API call
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReports(mockReports);
      } catch (error) {
        showError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [showError]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(() => {}, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, searchTerm, statusFilter, typeFilter]);

  const handleDownload = async (reportId) => {
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess('Report download started');
    } catch (error) {
      showError('Download failed');
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setReports(prev => prev.filter(r => r.id !== reportId));
      showSuccess('Report deleted successfully');
    } catch (error) {
      showError('Failed to delete report');
    }
  };

  const handleRunReport = async (reportId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, status: 'running', createdAt: new Date().toISOString() }
          : r
      ));
      showSuccess('Report execution started');
    } catch (error) {
      showError('Failed to run report');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'success', icon: '✅', label: 'Completed' },
      running: { class: 'warning', icon: '⏳', label: 'Running' },
      failed: { class: 'danger', icon: '❌', label: 'Failed' },
      scheduled: { class: 'info', icon: '📅', label: 'Scheduled' },
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeConfig = reportTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : '📄';
  };

  if (!hasPermission('reports:read')) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view reports.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="page-header">
        <h2>Reports</h2>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="reports-grid">
        {filteredReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-title">
                <span className="report-type-icon">{getTypeIcon(report.type)}</span>
                <h3>{report.name}</h3>
              </div>
              {getStatusBadge(report.status)}
            </div>

            <div className="report-description">
              {report.description}
            </div>

            <div className="report-details">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">
                  {reportTypes.find(t => t.value === report.type)?.label || report.type}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Format:</span>
                <span className="detail-value">{report.format}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Schedule:</span>
                <span className="detail-value">
                  {scheduleOptions.find(s => s.value === report.schedule)?.label || report.schedule}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Created:</span>
                <span className="detail-value">
                  {formatDistanceToNow(report.createdAt)}
                </span>
              </div>

              {report.completedAt && (
                <div className="detail-row">
                  <span className="detail-label">Completed:</span>
                  <span className="detail-value">
                    {formatDistanceToNow(report.completedAt)}
                  </span>
                </div>
              )}

              {report.size && (
                <div className="detail-row">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{report.size}</span>
                </div>
              )}

              {report.nextRun && (
                <div className="detail-row">
                  <span className="detail-label">Next Run:</span>
                  <span className="detail-value">
                    {formatDate(report.nextRun, 'PPp')}
                  </span>
                </div>
              )}
            </div>

            <div className="report-actions">
              {report.status === 'completed' && (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleDownload(report.id)}
                >
                  ⬇️ Download
                </button>
              )}
              
              {(report.status === 'failed' || report.status === 'scheduled') && (
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleRunReport(report.id)}
                >
                  ▶️ Run Now
                </button>
              )}
              
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => setSelectedReport(report)}
              >
                👁️ View
              </button>
              
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteReport(report.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No reports found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="reports-summary">
        <div className="summary-card">
          <h4>Total Reports</h4>
          <div className="summary-value">{reports.length}</div>
        </div>
        
        <div className="summary-card">
          <h4>Completed</h4>
          <div className="summary-value">
            {reports.filter(r => r.status === 'completed').length}
          </div>
        </div>
        
        <div className="summary-card">
          <h4>Running</h4>
          <div className="summary-value">
            {reports.filter(r => r.status === 'running').length}
          </div>
        </div>
        
        <div className="summary-card">
          <h4>Scheduled</h4>
          <div className="summary-value">
            {reports.filter(r => r.status === 'scheduled').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 
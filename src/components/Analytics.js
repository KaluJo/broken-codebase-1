import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDate, getDateRanges, createDateRangeFilter } from '../utils/dateUtils';
import { debounce } from '../utils/performanceUtils';

const Analytics = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30Days');
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState('users');
  const navigate = useNavigate();

  const { hasPermission } = useAuth();
  const { showError } = useNotifications();

  const mockData = {
    users: {
      total: 15284,
      change: 12.5,
      trend: 'up',
      chartData: [
        { date: '2024-01-01', value: 12500 },
        { date: '2024-01-08', value: 13200 },
        { date: '2024-01-15', value: 14100 },
        { date: '2024-01-22', value: 14800 },
        { date: '2024-01-29', value: 15284 },
      ],
    },
    revenue: {
      total: 89745.50,
      change: -3.2,
      trend: 'down',
      chartData: [
        { date: '2024-01-01', value: 92500.00 },
        { date: '2024-01-08', value: 91200.25 },
        { date: '2024-01-15', value: 90100.75 },
        { date: '2024-01-22', value: 89950.00 },
        { date: '2024-01-29', value: 89745.50 },
      ],
    },
    sessions: {
      total: 45672,
      change: 8.9,
      trend: 'up',
      chartData: [
        { date: '2024-01-01', value: 42000 },
        { date: '2024-01-08', value: 43500 },
        { date: '2024-01-15', value: 44200 },
        { date: '2024-01-22', value: 45100 },
        { date: '2024-01-29', value: 45672 },
      ],
    },
    conversion: {
      total: 3.47,
      change: 0.23,
      trend: 'up',
      chartData: [
        { date: '2024-01-01', value: 3.24 },
        { date: '2024-01-08', value: 3.31 },
        { date: '2024-01-15', value: 3.38 },
        { date: '2024-01-22', value: 3.42 },
        { date: '2024-01-29', value: 3.47 },
      ],
    },
  };

  const topPages = [
    { path: '/dashboard', views: 12543, change: 5.2 },
    { path: '/user-logs', views: 8932, change: -2.1 },
    { path: '/analytics', views: 6754, change: 15.8 },
    { path: '/settings', views: 4321, change: 3.4 },
    { path: '/user-management', views: 3876, change: 8.7 },
  ];

  const userBehavior = {
    avgSessionDuration: '4m 32s',
    bounceRate: '34.2%',
    pagesPerSession: 2.8,
    newVsReturning: {
      new: 68.5,
      returning: 31.5,
    },
  };

  // Initialize dateRange from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const dateRangeParam = searchParams.get('dateRange');
    
    if (dateRangeParam) {
      setDateRange(dateRangeParam);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const dateRanges = getDateRanges();
        const filterFn = createDateRangeFilter(dateRange);
        
        const filteredData = Object.keys(mockData).reduce((acc, key) => {
          const data = mockData[key];
          const filteredChartData = data.chartData.filter(item => 
            filterFn({ createdAt: item.date }, 'createdAt')
          );
          
          acc[key] = {
            ...data,
            chartData: filteredChartData,
          };
          return acc;
        }, {});
        
        setMetrics(filteredData);
        setChartData(filteredData[selectedMetric] || filteredData.users);
      } catch (error) {
        showError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, selectedMetric, showError, mockData]);

  const debouncedMetricChange = useMemo(
    () => debounce((metric) => {
      setChartData(metrics[metric] || {});
    }, 300),
    [metrics]
  );

  useEffect(() => {
    debouncedMetricChange(selectedMetric);
  }, [selectedMetric, debouncedMetricChange]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getChangeIcon = (trend) => {
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '📊';
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'success' : change < 0 ? 'danger' : 'neutral';
  };

  const handleDateRangeChange = (e) => {
    const newDateRange = e.target.value;
    navigate(`/analytics?dateRange=${newDateRange}`, { replace: true });
  };

  if (!hasPermission('analytics:read')) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="page-header">
        <h2>Analytics Dashboard</h2>
        <div className="page-controls">
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="date-range-select"
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

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Total Users</h3>
            <span className="metric-icon">👥</span>
          </div>
          <div className="metric-value">
            {formatNumber(metrics.users?.total || 0)}
          </div>
          <div className={`metric-change ${getChangeColor(metrics.users?.change || 0)}`}>
            {getChangeIcon(metrics.users?.trend)} 
            {Math.abs(metrics.users?.change || 0)}% vs previous period
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Revenue</h3>
            <span className="metric-icon">💰</span>
          </div>
          <div className="metric-value">
            {formatCurrency(metrics.revenue?.total || 0)}
          </div>
          <div className={`metric-change ${getChangeColor(metrics.revenue?.change || 0)}`}>
            {getChangeIcon(metrics.revenue?.trend)} 
            {Math.abs(metrics.revenue?.change || 0)}% vs previous period
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Sessions</h3>
            <span className="metric-icon">🔄</span>
          </div>
          <div className="metric-value">
            {formatNumber(metrics.sessions?.total || 0)}
          </div>
          <div className={`metric-change ${getChangeColor(metrics.sessions?.change || 0)}`}>
            {getChangeIcon(metrics.sessions?.trend)} 
            {Math.abs(metrics.sessions?.change || 0)}% vs previous period
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Conversion Rate</h3>
            <span className="metric-icon">🎯</span>
          </div>
          <div className="metric-value">
            {(metrics.conversion?.total || 0).toFixed(2)}%
          </div>
          <div className={`metric-change ${getChangeColor(metrics.conversion?.change || 0)}`}>
            {getChangeIcon(metrics.conversion?.trend)} 
            {Math.abs(metrics.conversion?.change || 0)}% vs previous period
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h3>Trend Analysis</h3>
          <div className="chart-controls">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-select"
            >
              <option value="users">Users</option>
              <option value="revenue">Revenue</option>
              <option value="sessions">Sessions</option>
              <option value="conversion">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        <div className="chart-container">
          <div className="simple-chart">
            {chartData.chartData?.map((point, index) => (
              <div key={index} className="chart-point">
                <div className="chart-bar" style={{
                  height: `${(point.value / Math.max(...(chartData.chartData?.map(p => p.value) || [1]))) * 100}%`
                }}>
                  <div className="chart-value">{formatNumber(point.value)}</div>
                </div>
                <div className="chart-date">{formatDate(point.date, 'MMM dd')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="secondary-metrics">
        <div className="metric-group">
          <h3>Top Pages</h3>
          <div className="top-pages-list">
            {topPages.map((page, index) => (
              <div key={index} className="page-item">
                <div className="page-info">
                  <span className="page-path">{page.path}</span>
                  <span className="page-views">{formatNumber(page.views)} views</span>
                </div>
                <div className={`page-change ${getChangeColor(page.change)}`}>
                  {page.change > 0 ? '+' : ''}{page.change}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-group">
          <h3>User Behavior</h3>
          <div className="behavior-metrics">
            <div className="behavior-item">
              <span className="behavior-label">Avg. Session Duration</span>
              <span className="behavior-value">{userBehavior.avgSessionDuration}</span>
            </div>
            <div className="behavior-item">
              <span className="behavior-label">Bounce Rate</span>
              <span className="behavior-value">{userBehavior.bounceRate}</span>
            </div>
            <div className="behavior-item">
              <span className="behavior-label">Pages per Session</span>
              <span className="behavior-value">{userBehavior.pagesPerSession}</span>
            </div>
          </div>
          
          <div className="user-split">
            <h4>New vs Returning Users</h4>
            <div className="split-chart">
              <div 
                className="split-bar new-users" 
                style={{ width: `${userBehavior.newVsReturning.new}%` }}
              >
                New ({userBehavior.newVsReturning.new}%)
              </div>
              <div 
                className="split-bar returning-users" 
                style={{ width: `${userBehavior.newVsReturning.returning}%` }}
              >
                Returning ({userBehavior.newVsReturning.returning}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <h3>Export Data</h3>
        <div className="export-buttons">
          <button className="btn btn-secondary">
            📄 Export CSV
          </button>
          <button className="btn btn-secondary">
            📊 Export PDF Report
          </button>
          <button className="btn btn-secondary">
            📈 Export Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 
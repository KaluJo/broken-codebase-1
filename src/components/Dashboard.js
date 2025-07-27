import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MdRefresh, 
  MdFileDownload, 
  MdPeople, 
  MdAttachMoney, 
  MdShoppingCart, 
  MdSpeed,
  MdTrendingUp,
  MdTrendingDown,
  MdShowChart,
  MdPieChart,
  MdMap,
  MdAnalytics,
  MdCheckCircle,
  MdStorage,
  MdApi,
  MdCloud,
  MdMonitor,
  MdSecurity,
  MdDescription,
  MdDevices
} from 'react-icons/md';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <div className="dashboard-actions">
          <button className="btn btn-primary">
            <MdRefresh className="btn-icon" />
            Refresh Data
          </button>
          <button className="btn btn-secondary">
            <MdFileDownload className="btn-icon" />
            Export Report
          </button>
        </div>
      </div>



      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <MdPeople />
          </div>
          <div className="metric-content">
            <div className="metric-value">1,247</div>
            <div className="metric-label">Active Users</div>
            <div className="metric-change positive">
              <MdTrendingUp />
              +12.5%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <MdAttachMoney />
          </div>
          <div className="metric-content">
            <div className="metric-value">$47,392</div>
            <div className="metric-label">Monthly Revenue</div>
            <div className="metric-change positive">
              <MdTrendingUp />
              +8.2%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <MdShoppingCart />
          </div>
          <div className="metric-content">
            <div className="metric-value">892</div>
            <div className="metric-label">New Orders</div>
            <div className="metric-change negative">
              <MdTrendingDown />
              -3.1%
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <MdSpeed />
          </div>
          <div className="metric-content">
            <div className="metric-value">99.2%</div>
            <div className="metric-label">System Uptime</div>
            <div className="metric-change positive">
              <MdTrendingUp />
              +0.3%
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <MdShowChart className="card-icon" />
              Revenue Trends
            </h3>
            <div className="card-actions">
              <select className="time-filter">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>
          <div className="chart-container">
            <img src="/images/revenue-chart.jpg" alt="Revenue Chart" className="chart-image" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <MdPieChart className="card-icon" />
              User Activity
            </h3>
          </div>
          <div className="chart-container">
            <img src="/images/activity-chart.jpg" alt="Activity Chart" className="chart-image" />
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <MdMap className="card-icon" />
              Geographic Distribution
            </h3>
          </div>
          <div className="map-container">
            <img src="/images/world-map.jpg" alt="World Map" className="map-image" />
            <div className="map-stats">
              <div className="stat-item">
                <span>🇺🇸</span>
                <span>United States</span>
                <span className="stat-value">45.2%</span>
              </div>
              <div className="stat-item">
                <span>🇬🇧</span>
                <span>United Kingdom</span>
                <span className="stat-value">18.7%</span>
              </div>
              <div className="stat-item">
                <span>🇨🇦</span>
                <span>Canada</span>
                <span className="stat-value">12.1%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <MdAnalytics className="card-icon" />
              Recent Activity
            </h3>
            <Link to="/user-logs" className="view-all-link">
              View All Logs
            </Link>
          </div>
          <div className="activity-feed">
            <div className="activity-item">
              <img src="/images/office-people.jpg" alt="User" className="activity-avatar" />
              <div className="activity-content">
                <div className="activity-text">
                  <strong>Sarah Johnson</strong> updated user permissions
                </div>
                <div className="activity-time">2 minutes ago</div>
              </div>
              <MdSecurity className="activity-type" />
            </div>
            
            <div className="activity-item">
              <img src="/images/office-people.jpg" alt="User" className="activity-avatar" />
              <div className="activity-content">
                <div className="activity-text">
                  <strong>Mike Chen</strong> generated monthly report
                </div>
                <div className="activity-time">5 minutes ago</div>
              </div>
              <MdDescription className="activity-type" />
            </div>
            
            <div className="activity-item">
              <img src="/images/office-people.jpg" alt="User" className="activity-avatar" />
              <div className="activity-content">
                <div className="activity-text">
                  <strong>Emma Davis</strong> logged in from new device
                </div>
                <div className="activity-time">12 minutes ago</div>
              </div>
              <MdDevices className="activity-type" />
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status-card">
        <div className="card-header">
          <h3>
            <MdCloud className="card-icon" />
            System Status
          </h3>
          <div className="status-indicator online">
            <MdCheckCircle />
            All Systems Operational
          </div>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <MdStorage className="status-icon" />
            <div className="status-info">
              <div className="status-name">Database</div>
              <div className="status-value">Operational</div>
            </div>
            <div className="status-badge success">
              <MdCheckCircle />
            </div>
          </div>
          
          <div className="status-item">
            <MdApi className="status-icon" />
            <div className="status-info">
              <div className="status-name">API Gateway</div>
              <div className="status-value">Operational</div>
            </div>
            <div className="status-badge success">
              <MdCheckCircle />
            </div>
          </div>
          
          <div className="status-item">
            <MdCloud className="status-icon" />
            <div className="status-info">
              <div className="status-name">CDN</div>
              <div className="status-value">Operational</div>
            </div>
            <div className="status-badge success">
              <MdCheckCircle />
            </div>
          </div>
          
          <div className="status-item">
            <MdMonitor className="status-icon" />
            <div className="status-info">
              <div className="status-name">Monitoring</div>
              <div className="status-value">Operational</div>
            </div>
            <div className="status-badge success">
              <MdCheckCircle />
            </div>
          </div>
        </div>
      </div>

              {/* Analytics and reporting section */}
      <div className="card" style={{marginTop: '2rem', background: '#f8f9fa', border: '1px solid #dee2e6'}}>
        <p style={{margin: 0, color: '#6c757d'}}>
          💡 <strong>Tip:</strong> Try navigating to the User Logs page with query parameters like <code>?user=123</code> 
          to see detailed activity logs for specific users.
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 
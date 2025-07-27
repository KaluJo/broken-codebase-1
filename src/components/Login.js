import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  MdEmail, 
  MdLock, 
  MdLogin, 
  MdAutorenew,
  MdPeople,
  MdSupervisorAccount,
  MdPerson,
  MdSecurity,
  MdBusiness
} from 'react-icons/md';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state, default to dashboard
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login({ email, password });
    if (result.success) {
      addNotification('success', 'Welcome back!', 'Successfully logged in to admin panel');
      console.log('🧭 Redirecting to:', from);
      navigate(from, { replace: true });
    } else {
      addNotification('error', 'Login Failed', result.error || 'Invalid credentials');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (userType) => {
    console.log('🚀 Quick login clicked:', userType);
    setIsLoading(true);
    
    const credentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      manager: { email: 'manager@example.com', password: 'manager123' },
      user: { email: 'user@example.com', password: 'user123' }
    };

    const { email, password } = credentials[userType];
    console.log('📧 Using credentials:', { email, password });
    
    try {
      const result = await login({ email, password });
      console.log('✅ Login result:', result);
      
      if (result.success) {
        addNotification('success', 'Welcome back!', `Logged in as ${userType}`);
        console.log('🧭 Quick login redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        console.error('❌ Login failed:', result.error);
        addNotification('error', 'Login Failed', result.error || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Login exception:', error);
      addNotification('error', 'Login Error', error.message || 'Unexpected error occurred');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <img src="/images/office-background.jpg" alt="" className="background-image" />
        <div className="background-overlay"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <img src="/images/logo.png" alt="Company Logo" className="login-logo" />
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <MdEmail className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <MdLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#forgot" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <MdAutorenew className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                <MdLogin className="btn-icon" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="quick-login">
          <h4>
            <MdPeople className="section-icon" />
            Quick Access
          </h4>
          <div className="quick-login-buttons">
            <button 
              onClick={() => handleQuickLogin('admin')}
              className="btn btn-primary quick-btn"
              disabled={isLoading}
              style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c' }}
            >
              <MdSupervisorAccount className="btn-icon" />
              Admin Access
            </button>
            <button 
              onClick={() => handleQuickLogin('manager')}
              className="btn btn-secondary quick-btn"
              disabled={isLoading}
            >
              <MdPeople className="btn-icon" />
              Manager Demo
            </button>
            <button 
              onClick={() => handleQuickLogin('user')}
              className="btn btn-secondary quick-btn"
              disabled={isLoading}
            >
              <MdPerson className="btn-icon" />
              User Demo
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
            Demo accounts available for evaluation
          </p>
        </div>

        <div className="login-footer">
          <div className="security-notice">
            <MdSecurity className="security-icon" />
            <span>Secured with enterprise-grade encryption</span>
          </div>
          <div className="company-info">
            <MdBusiness className="company-icon" />
            <span>© 2024 Enterprise Solutions Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
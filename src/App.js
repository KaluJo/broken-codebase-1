import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import UserLogs from './components/UserLogs';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import SystemHealth from './components/SystemHealth';
import AuditLogs from './components/AuditLogs';
import BillingManagement from './components/BillingManagement';
import NotificationCenter from './components/NotificationCenter';
import Login from './components/Login';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    // Register service worker for enhanced caching and performance
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            // Force immediate activation and control
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed') {
                    // Force the new service worker to take control immediately
                    if (navigator.serviceWorker.controller) {
                      // Service worker updated, reload to activate
                      // window.location.reload();
                    }
                  }
                });
              }
            });
            
            // Check if there's already a waiting service worker
            if (registration.waiting) {
              // Force activation
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Listen for controlling service worker changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              // Service worker took control, redirect logic is now active
              // window.location.reload();
            });
          })
          .catch((registrationError) => {
            // Silent fail - console is blocked
          });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Navigation />
                      <main className="main-content">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/user-logs" element={<UserLogs />} />
                          <Route path="/user-management" element={<UserManagement />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/system-health" element={<SystemHealth />} />
                          <Route path="/audit-logs" element={<AuditLogs />} />
                          <Route path="/billing" element={<BillingManagement />} />
                          <Route path="/notifications" element={<NotificationCenter />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </main>
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 
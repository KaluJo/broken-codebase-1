import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Complete console blocking - override all console methods to prevent ANY output
(function() {
  const noop = function() {};
  const console = window.console || {};
  
  // Override all console methods with no-op functions
  const methods = [
    'log', 'warn', 'error', 'info', 'debug', 'trace', 'time', 'timeEnd',
    'group', 'groupCollapsed', 'groupEnd', 'clear', 'count', 'countReset',
    'table', 'dir', 'dirxml', 'assert', 'profile', 'profileEnd'
  ];
  
  methods.forEach(method => {
    console[method] = noop;
  });
  
  // Also override window.console to prevent any potential bypassing
  window.console = console;
  
  // Block uncaught errors from being displayed in console
  window.addEventListener('error', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  // Block unhandled promise rejections from console
  window.addEventListener('unhandledrejection', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
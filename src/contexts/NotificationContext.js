import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  systemAlerts: [],
  unreadCount: 0,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        unreadCount: state.unreadCount + 1,
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'ADD_SYSTEM_ALERT':
      return {
        ...state,
        systemAlerts: [...state.systemAlerts, action.payload],
      };
    case 'REMOVE_SYSTEM_ALERT':
      return {
        ...state,
        systemAlerts: state.systemAlerts.filter(a => a.id !== action.payload),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification) => {
    const id = uuidv4();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: newNotification,
    });

    // Auto-remove notification after delay if specified
    if (notification.autoRemove !== false) {
      const delay = notification.duration || 5000;
      setTimeout(() => {
        dispatch({
          type: 'REMOVE_NOTIFICATION',
          payload: id,
        });
      }, delay);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id,
    });
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch({
      type: 'MARK_AS_READ',
      payload: id,
    });
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    return addNotification({
      type: 'toast',
      level: type,
      message,
      ...options,
    });
  }, [addNotification]);

  const showSuccess = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    return showToast(message, 'error', { duration: 8000, ...options });
  }, [showToast]);

  const showWarning = useCallback((message, options = {}) => {
    return showToast(message, 'warning', { duration: 6000, ...options });
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    return showToast(message, 'info', options);
  }, [showToast]);

  const addSystemAlert = useCallback((alert) => {
    const id = uuidv4();
    dispatch({
      type: 'ADD_SYSTEM_ALERT',
      payload: {
        id,
        timestamp: new Date().toISOString(),
        ...alert,
      },
    });
    return id;
  }, []);

  const removeSystemAlert = useCallback((id) => {
    dispatch({
      type: 'REMOVE_SYSTEM_ALERT',
      payload: id,
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  const value = {
    ...state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllRead,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addSystemAlert,
    removeSystemAlert,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { localStorageService } from '../services/localStorageService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],
  sessionExpiry: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        permissions: action.payload.permissions,
        sessionExpiry: action.payload.sessionExpiry,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'REFRESH_SESSION':
      return {
        ...state,
        sessionExpiry: action.payload.sessionExpiry,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorageService.getToken();
        if (token) {
          const userData = await authService.validateToken(token);
          if (userData) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: userData,
            });
            return;
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorageService.removeToken();
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initializeAuth();
  }, []);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (state.sessionExpiry && state.isAuthenticated) {
      const timeUntilExpiry = new Date(state.sessionExpiry).getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000); // 5 minutes before expiry, minimum 1 minute

      const timeoutId = setTimeout(async () => {
        try {
          const refreshedSession = await authService.refreshSession();
          dispatch({
            type: 'REFRESH_SESSION',
            payload: refreshedSession,
          });
        } catch (error) {
          console.error('Session refresh failed:', error);
          logout();
        }
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    }
  }, [state.sessionExpiry, state.isAuthenticated]);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(credentials);
      
      localStorageService.setToken(response.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorageService.removeToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const hasPermission = (permission) => {
    return state.permissions.includes(permission) || state.permissions.includes('admin');
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
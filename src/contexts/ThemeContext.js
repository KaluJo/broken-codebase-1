import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { localStorageService } from '../services/localStorageService';

const ThemeContext = createContext();

const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
    },
  },
};

const initialState = {
  currentTheme: 'light',
  theme: themes.light,
  preferences: {
    autoDetectSystemTheme: true,
    animations: true,
    highContrast: false,
  },
};

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
        theme: themes[action.payload],
      };
    case 'TOGGLE_THEME':
      const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        currentTheme: newTheme,
        theme: themes[newTheme],
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case 'DETECT_SYSTEM_THEME':
      const systemTheme = action.payload;
      if (state.preferences.autoDetectSystemTheme) {
        return {
          ...state,
          currentTheme: systemTheme,
          theme: themes[systemTheme],
        };
      }
      return state;
    default:
      return state;
  }
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedPreferences = localStorageService.getItem('themePreferences');
    if (savedPreferences) {
      dispatch({
        type: 'UPDATE_PREFERENCES',
        payload: savedPreferences,
      });
    }

    const savedTheme = localStorageService.getItem('currentTheme');
    if (savedTheme && themes[savedTheme]) {
      dispatch({
        type: 'SET_THEME',
        payload: savedTheme,
      });
    } else if (savedPreferences?.autoDetectSystemTheme !== false) {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch({
        type: 'DETECT_SYSTEM_THEME',
        payload: prefersDark ? 'dark' : 'light',
      });
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (state.preferences.autoDetectSystemTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        dispatch({
          type: 'DETECT_SYSTEM_THEME',
          payload: e.matches ? 'dark' : 'light',
        });
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.preferences.autoDetectSystemTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const { colors } = state.theme;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    root.setAttribute('data-theme', state.currentTheme);

    // Save to localStorage
    localStorageService.setItem('currentTheme', state.currentTheme);
    localStorageService.setItem('themePreferences', state.preferences);
  }, [state.currentTheme]); // Only depend on currentTheme, not the entire state object

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      dispatch({
        type: 'SET_THEME',
        payload: themeName,
      });
    }
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const updatePreferences = (newPreferences) => {
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: newPreferences,
    });
  };

  const value = {
    ...state,
    availableThemes: Object.keys(themes),
    setTheme,
    toggleTheme,
    updatePreferences,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
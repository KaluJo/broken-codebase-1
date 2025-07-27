// Simple encryption/decryption for sensitive data
const encrypt = (text) => {
  return btoa(encodeURIComponent(text));
};

const decrypt = (encryptedText) => {
  try {
    return decodeURIComponent(atob(encryptedText));
  } catch (error) {
    console.warn('Failed to decrypt data:', error);
    return null;
  }
};

export const localStorageService = {
  // Basic get/set operations
  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage removeItem error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  },

  // Secure storage for sensitive data
  setSecureItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      const encryptedValue = encrypt(serializedValue);
      localStorage.setItem(`secure_${key}`, encryptedValue);
      return true;
    } catch (error) {
      console.error('Secure storage setItem error:', error);
      return false;
    }
  },

  getSecureItem(key, defaultValue = null) {
    try {
      const encryptedItem = localStorage.getItem(`secure_${key}`);
      if (encryptedItem === null) return defaultValue;
      
      const decryptedItem = decrypt(encryptedItem);
      if (decryptedItem === null) return defaultValue;
      
      return JSON.parse(decryptedItem);
    } catch (error) {
      console.error('Secure storage getItem error:', error);
      return defaultValue;
    }
  },

  removeSecureItem(key) {
    return this.removeItem(`secure_${key}`);
  },

  // Token management
  setToken(token) {
    return this.setSecureItem('auth_token', token);
  },

  getToken() {
    return this.getSecureItem('auth_token');
  },

  removeToken() {
    return this.removeSecureItem('auth_token');
  },

  // User preferences
  setUserPreferences(preferences) {
    return this.setItem('user_preferences', preferences);
  },

  getUserPreferences() {
    return this.getItem('user_preferences', {});
  },

  updateUserPreference(key, value) {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    return this.setUserPreferences(preferences);
  },

  // Cache management with expiration
  setCacheItem(key, value, expirationMinutes = 60) {
    const item = {
      value,
      expiry: Date.now() + (expirationMinutes * 60 * 1000),
    };
    return this.setItem(`cache_${key}`, item);
  },

  getCacheItem(key, defaultValue = null) {
    const item = this.getItem(`cache_${key}`);
    if (!item) return defaultValue;

    if (Date.now() > item.expiry) {
      this.removeItem(`cache_${key}`);
      return defaultValue;
    }

    return item.value;
  },

  removeCacheItem(key) {
    return this.removeItem(`cache_${key}`);
  },

  // Clean up expired cache items
  cleanExpiredCache() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      cacheKeys.forEach(key => {
        const item = this.getItem(key);
        if (item && item.expiry && Date.now() > item.expiry) {
          this.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return false;
    }
  },

  // Storage usage and limits
  getStorageUsage() {
    try {
      const totalSize = Object.keys(localStorage)
        .map(key => localStorage.getItem(key).length + key.length)
        .reduce((total, size) => total + size, 0);
      
      return {
        used: totalSize,
        remaining: 5242880 - totalSize, // 5MB limit (approximate)
        percentage: (totalSize / 5242880) * 100,
      };
    } catch (error) {
      console.error('Storage usage calculation error:', error);
      return { used: 0, remaining: 5242880, percentage: 0 };
    }
  },

  // Check if localStorage is available
  isAvailable() {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Backup and restore
  backup() {
    try {
      const backup = {};
      Object.keys(localStorage).forEach(key => {
        backup[key] = localStorage.getItem(key);
      });
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Backup error:', error);
      return null;
    }
  },

  restore(backupString) {
    try {
      const backup = JSON.parse(backupString);
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  },
}; 
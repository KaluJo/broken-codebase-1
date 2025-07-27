import axios from 'axios';
import { localStorageService } from './localStorageService';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for tracking
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
              console.log(`[SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = error.config?.metadata ? endTime - error.config.metadata.startTime : 0;
    
    // Log failed requests
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error);
    }
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorageService.removeToken();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          error.message = 'You do not have permission to perform this action';
          break;
        case 404:
          // Not found
          error.message = 'Resource not found';
          break;
        case 429:
          // Rate limited
          error.message = 'Too many requests. Please try again later.';
          break;
        case 500:
          // Server error
          error.message = 'Internal server error. Please try again later.';
          break;
        default:
          error.message = data?.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Network error
      error.message = 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      error.message = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const retryRequest = async (originalRequest, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await api(originalRequest);
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const apiService = {
  // Generic HTTP methods
  async get(url, config = {}) {
    return api.get(url, config);
  },

  async post(url, data = {}, config = {}) {
    return api.post(url, data, config);
  },

  async put(url, data = {}, config = {}) {
    return api.put(url, data, config);
  },

  async patch(url, data = {}, config = {}) {
    return api.patch(url, data, config);
  },

  async delete(url, config = {}) {
    return api.delete(url, config);
  },

  // File upload with progress tracking
  async uploadFile(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  // Download file with progress tracking
  async downloadFile(url, filename, onProgress = null) {
    return api.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    }).then((response) => {
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(blobUrl);
      
      return response;
    });
  },

  // Batch requests
  async batch(requests) {
    try {
      const responses = await Promise.allSettled(
        requests.map(request => api(request))
      );
      
      return responses.map((result, index) => ({
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason : null,
        originalRequest: requests[index],
      }));
    } catch (error) {
      throw new Error('Batch request failed');
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },

  // Cancel token creation
  createCancelToken() {
    return axios.CancelToken.source();
  },

  // Check if error is cancelled
  isCancel(error) {
    return axios.isCancel(error);
  },
}; 
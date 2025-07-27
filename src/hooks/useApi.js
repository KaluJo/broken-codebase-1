import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';

/**
 * Custom hook for API requests with loading, error, and data management
 * @param {string|Function} endpoint - API endpoint or function that returns endpoint
 * @param {object} options - Configuration options
 * @returns {object} API state and methods
 */
export const useApi = (endpoint, options = {}) => {
  const {
    method = 'GET',
    dependencies = [],
    immediate = true,
    transform = (data) => data,
    onSuccess = () => {},
    onError = () => {},
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const cancelTokenRef = useRef(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Clean up on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  const fetchData = useCallback(async (customEndpoint, customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New request initiated');
      }

      // Create new cancel token
      cancelTokenRef.current = apiService.createCancelToken();

      const url = customEndpoint || (typeof endpoint === 'function' ? endpoint() : endpoint);
      const requestOptions = {
        cancelToken: cancelTokenRef.current.token,
        ...customOptions,
      };

      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiService.get(url, requestOptions);
          break;
        case 'POST':
          response = await apiService.post(url, customOptions.data, requestOptions);
          break;
        case 'PUT':
          response = await apiService.put(url, customOptions.data, requestOptions);
          break;
        case 'PATCH':
          response = await apiService.patch(url, customOptions.data, requestOptions);
          break;
        case 'DELETE':
          response = await apiService.delete(url, requestOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      if (!mountedRef.current) return;

      const transformedData = transform(response.data);
      setData(transformedData);
      setLastFetch(new Date());
      retryCountRef.current = 0;
      
      onSuccess(transformedData, response);
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (apiService.isCancel(err)) {
        return; // Request was cancelled, don't update state
      }

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(customEndpoint, customOptions);
          }
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(err);
      onError(err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        cancelTokenRef.current = null;
      }
    }
  }, [endpoint, method, transform, onSuccess, onError, retry, retryDelay]);

  // Auto-fetch on dependency changes
  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  const refetch = useCallback((customOptions) => {
    return fetchData(undefined, customOptions);
  }, [fetchData]);

  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastFetch(null);
    retryCountRef.current = 0;
  }, []);

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    mutate,
    reset,
    isStale: lastFetch && (Date.now() - lastFetch.getTime()) > 300000, // 5 minutes
  };
};

/**
 * Hook for GET requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} API state and methods
 */
export const useGet = (endpoint, options = {}) => {
  return useApi(endpoint, { ...options, method: 'GET' });
};

/**
 * Hook for POST requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} API state and methods
 */
export const usePost = (endpoint, options = {}) => {
  return useApi(endpoint, { 
    ...options, 
    method: 'POST', 
    immediate: false // POST requests shouldn't auto-execute
  });
};

/**
 * Hook for PUT requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} API state and methods
 */
export const usePut = (endpoint, options = {}) => {
  return useApi(endpoint, { 
    ...options, 
    method: 'PUT', 
    immediate: false // PUT requests shouldn't auto-execute
  });
};

/**
 * Hook for DELETE requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} API state and methods
 */
export const useDelete = (endpoint, options = {}) => {
  return useApi(endpoint, { 
    ...options, 
    method: 'DELETE', 
    immediate: false // DELETE requests shouldn't auto-execute
  });
};

/**
 * Hook for paginated API requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} Paginated API state and methods
 */
export const usePaginatedApi = (endpoint, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    ...apiOptions
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const paginatedEndpoint = useCallback(() => {
    const url = typeof endpoint === 'function' ? endpoint() : endpoint;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}page=${currentPage}&pageSize=${pageSize}`;
  }, [endpoint, currentPage, pageSize]);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    ...rest
  } = useApi(paginatedEndpoint, {
    ...apiOptions,
    dependencies: [currentPage, pageSize, ...(apiOptions.dependencies || [])],
    transform: (response) => {
      const transformedData = apiOptions.transform ? apiOptions.transform(response) : response;
      
      // Update pagination info
      if (transformedData.pagination) {
        setPagination(transformedData.pagination);
      }
      
      return transformedData.data || transformedData;
    },
  });

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  }, [pagination.hasPrev]);

  const refetch = useCallback(() => {
    return originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!pagination.hasNext || loading) return;
    
    const nextPageData = await originalRefetch();
    if (nextPageData) {
      setAllData(prev => [...prev, ...nextPageData]);
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination.hasNext, loading, originalRefetch]);

  return {
    ...rest,
    data,
    allData,
    loading,
    error,
    pagination,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    refetch,
    loadMore,
  };
};

/**
 * Hook for infinite scroll API requests
 * @param {string} endpoint - API endpoint
 * @param {object} options - Configuration options
 * @returns {object} Infinite scroll API state and methods
 */
export const useInfiniteApi = (endpoint, options = {}) => {
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = usePaginatedApi(endpoint, {
    ...options,
    initialPage: page,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      if (page === 1) {
        setAllData(data);
      } else {
        setAllData(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === options.pageSize);
    }
  }, [data, page, options.pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refetch,
  };
};

export default useApi; 
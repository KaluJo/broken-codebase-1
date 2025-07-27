/**
 * Debounce function - delays execution until after delay milliseconds have passed
 * since the last time it was invoked
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay, immediate = false) => {
  let timeoutId;
  let lastArgs;
  let lastThis;
  
  const debounced = function(...args) {
    lastArgs = args;
    lastThis = this;
    
    const callNow = immediate && !timeoutId;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) {
        func.apply(lastThis, lastArgs);
      }
    }, delay);
    
    if (callNow) {
      func.apply(lastThis, lastArgs);
    }
  };
  
  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };
  
  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      func.apply(lastThis, lastArgs);
      timeoutId = null;
    }
  };
  
  return debounced;
};

/**
 * Throttle function - ensures function is called at most once per specified interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @param {object} options - Options object
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit, options = {}) => {
  const { leading = true, trailing = true } = options;
  let lastFunc;
  let lastRan;
  let lastArgs;
  let lastThis;
  
  const throttled = function(...args) {
    lastArgs = args;
    lastThis = this;
    
    if (!lastRan) {
      if (leading) {
        func.apply(lastThis, lastArgs);
      }
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          if (trailing) {
            func.apply(lastThis, lastArgs);
          }
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
  
  throttled.cancel = () => {
    clearTimeout(lastFunc);
    lastRan = null;
  };
  
  return throttled;
};

/**
 * Simple memoization function
 * @param {Function} func - Function to memoize
 * @param {Function} keyResolver - Function to resolve cache key
 * @returns {Function} Memoized function
 */
export const memoize = (func, keyResolver = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  const memoized = function(...args) {
    const key = keyResolver(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
  
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.delete = (key) => cache.delete(key);
  memoized.has = (key) => cache.has(key);
  
  return memoized;
};

/**
 * Request Animation Frame throttle for smooth animations
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF throttled function
 */
export const rafThrottle = (func) => {
  let rafId = null;
  let lastArgs;
  let lastThis;
  
  const throttled = function(...args) {
    lastArgs = args;
    lastThis = this;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(lastThis, lastArgs);
        rafId = null;
      });
    }
  };
  
  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  return throttled;
};

/**
 * Batch function calls to reduce frequency
 * @param {Function} func - Function to batch
 * @param {number} batchSize - Maximum batch size
 * @param {number} delay - Delay before processing batch
 * @returns {Function} Batched function
 */
export const batch = (func, batchSize = 10, delay = 100) => {
  let batch = [];
  let timeoutId;
  
  const processBatch = () => {
    if (batch.length > 0) {
      const currentBatch = [...batch];
      batch = [];
      func(currentBatch);
    }
    timeoutId = null;
  };
  
  const batched = function(item) {
    batch.push(item);
    
    if (batch.length >= batchSize) {
      clearTimeout(timeoutId);
      processBatch();
    } else if (!timeoutId) {
      timeoutId = setTimeout(processBatch, delay);
    }
  };
  
  batched.flush = () => {
    clearTimeout(timeoutId);
    processBatch();
  };
  
  batched.clear = () => {
    clearTimeout(timeoutId);
    batch = [];
    timeoutId = null;
  };
  
  return batched;
};

/**
 * Create a cache with LRU (Least Recently Used) eviction
 * @param {number} maxSize - Maximum cache size
 * @returns {object} LRU cache object
 */
export const createLRUCache = (maxSize = 100) => {
  const cache = new Map();
  
  const get = (key) => {
    if (cache.has(key)) {
      const value = cache.get(key);
      // Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    return undefined;
  };
  
  const set = (key, value) => {
    if (cache.has(key)) {
      // Update existing
      cache.delete(key);
    } else if (cache.size >= maxSize) {
      // Remove least recently used (first item)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, value);
  };
  
  const has = (key) => cache.has(key);
  const delete_ = (key) => cache.delete(key);
  const clear = () => cache.clear();
  const size = () => cache.size;
  const keys = () => Array.from(cache.keys());
  const values = () => Array.from(cache.values());
  
  return {
    get,
    set,
    has,
    delete: delete_,
    clear,
    size,
    keys,
    values,
  };
};

/**
 * Measure performance of a function
 * @param {Function} func - Function to measure
 * @param {string} label - Label for measurement
 * @returns {Function} Wrapped function with performance measurement
 */
export const measurePerformance = (func, label = 'Function') => {
  return function(...args) {
    const startTime = performance.now();
    const result = func.apply(this, args);
    const endTime = performance.now();
        
    return result;
  };
};

/**
 * Create a function that only executes once
 * @param {Function} func - Function to execute once
 * @returns {Function} Function that executes only once
 */
export const once = (func) => {
  let called = false;
  let result;
  
  return function(...args) {
    if (!called) {
      called = true;
      result = func.apply(this, args);
    }
    return result;
  };
};

/**
 * Retry function with exponential backoff
 * @param {Function} func - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (func, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await func();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Create a function queue with concurrency control
 * @param {number} concurrency - Maximum concurrent executions
 * @returns {object} Queue object with add method
 */
export const createQueue = (concurrency = 1) => {
  let running = 0;
  const queue = [];
  
  const next = () => {
    if (running >= concurrency || queue.length === 0) {
      return;
    }
    
    running++;
    const { func, resolve, reject } = queue.shift();
    
    func()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        running--;
        next();
      });
  };
  
  const add = (func) => {
    return new Promise((resolve, reject) => {
      queue.push({ func, resolve, reject });
      next();
    });
  };
  
  const size = () => queue.length;
  const pending = () => running;
  
  return {
    add,
    size,
    pending,
  };
};

/**
 * Deep clone an object (performance-optimized for common cases)
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}; 
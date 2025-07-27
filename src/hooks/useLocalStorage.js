import { useState, useEffect, useCallback, useRef } from 'react';
import { localStorageService } from '../services/localStorageService';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - localStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @param {object} options - Configuration options
 * @returns {[any, Function, Function]} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, defaultValue = null, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
    onError = console.error,
  } = options;

  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      
      if (item === null) {
        return defaultValueRef.current;
      }
      
      return deserialize(item);
    } catch (error) {
      onError(`Error reading localStorage key "${key}":`, error);
      return defaultValueRef.current;
    }
  });

  // Wrapped setState function
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for setState-like usage
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined || valueToStore === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, serialize(valueToStore));
      }
      
      // Dispatch custom event for cross-tab sync
      if (syncAcrossTabs) {
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: valueToStore === undefined || valueToStore === null 
            ? null 
            : serialize(valueToStore),
          oldValue: localStorage.getItem(key),
          storageArea: localStorage,
        }));
      }
    } catch (error) {
      onError(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue, syncAcrossTabs, onError]);

  // Remove value function
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValueRef.current);
      localStorage.removeItem(key);
      
      if (syncAcrossTabs) {
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: null,
          oldValue: localStorage.getItem(key),
          storageArea: localStorage,
        }));
      }
    } catch (error) {
      onError(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, syncAcrossTabs, onError]);

  // Listen for changes in other tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e) => {
      if (e.key !== key || e.storageArea !== localStorage) return;

      try {
        const newValue = e.newValue === null 
          ? defaultValueRef.current 
          : deserialize(e.newValue);
        
        setStoredValue(newValue);
      } catch (error) {
        onError(`Error syncing localStorage key "${key}" across tabs:`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, deserialize, syncAcrossTabs, onError]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing boolean values in localStorage
 * @param {string} key - localStorage key
 * @param {boolean} defaultValue - Default boolean value
 * @returns {[boolean, Function, Function]} [value, toggle, setValue]
 */
export const useLocalStorageBoolean = (key, defaultValue = false) => {
  const [value, setValue, removeValue] = useLocalStorage(key, defaultValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, [setValue]);

  return [Boolean(value), toggle, setValue, removeValue];
};

/**
 * Hook for managing arrays in localStorage
 * @param {string} key - localStorage key
 * @param {Array} defaultValue - Default array value
 * @returns {[Array, object]} [array, methods]
 */
export const useLocalStorageArray = (key, defaultValue = []) => {
  const [array, setArray, removeArray] = useLocalStorage(key, defaultValue);

  const methods = {
    push: useCallback((item) => {
      setArray(prev => [...(prev || []), item]);
    }, [setArray]),

    pop: useCallback(() => {
      setArray(prev => {
        const newArray = [...(prev || [])];
        newArray.pop();
        return newArray;
      });
    }, [setArray]),

    unshift: useCallback((item) => {
      setArray(prev => [item, ...(prev || [])]);
    }, [setArray]),

    shift: useCallback(() => {
      setArray(prev => {
        const newArray = [...(prev || [])];
        newArray.shift();
        return newArray;
      });
    }, [setArray]),

    insert: useCallback((index, item) => {
      setArray(prev => {
        const newArray = [...(prev || [])];
        newArray.splice(index, 0, item);
        return newArray;
      });
    }, [setArray]),

    remove: useCallback((index) => {
      setArray(prev => {
        const newArray = [...(prev || [])];
        newArray.splice(index, 1);
        return newArray;
      });
    }, [setArray]),

    update: useCallback((index, item) => {
      setArray(prev => {
        const newArray = [...(prev || [])];
        newArray[index] = item;
        return newArray;
      });
    }, [setArray]),

    filter: useCallback((predicate) => {
      setArray(prev => (prev || []).filter(predicate));
    }, [setArray]),

    map: useCallback((mapper) => {
      setArray(prev => (prev || []).map(mapper));
    }, [setArray]),

    clear: useCallback(() => {
      setArray([]);
    }, [setArray]),

    set: setArray,
    remove: removeArray,
  };

  return [array || [], methods];
};

/**
 * Hook for managing objects in localStorage
 * @param {string} key - localStorage key
 * @param {object} defaultValue - Default object value
 * @returns {[object, object]} [object, methods]
 */
export const useLocalStorageObject = (key, defaultValue = {}) => {
  const [object, setObject, removeObject] = useLocalStorage(key, defaultValue);

  const methods = {
    setProperty: useCallback((property, value) => {
      setObject(prev => ({
        ...(prev || {}),
        [property]: value,
      }));
    }, [setObject]),

    removeProperty: useCallback((property) => {
      setObject(prev => {
        const newObject = { ...(prev || {}) };
        delete newObject[property];
        return newObject;
      });
    }, [setObject]),

    merge: useCallback((partialObject) => {
      setObject(prev => ({
        ...(prev || {}),
        ...partialObject,
      }));
    }, [setObject]),

    reset: useCallback(() => {
      setObject(defaultValue);
    }, [setObject, defaultValue]),

    clear: useCallback(() => {
      setObject({});
    }, [setObject]),

    set: setObject,
    remove: removeObject,
  };

  return [object || {}, methods];
};

export default useLocalStorage; 
import { format, formatDistanceToNow as fnsFormatDistanceToNow, parseISO, isValid, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - Date to format
 * @param {string} formatString - Format pattern (default: 'PPp')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'PPp') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date to show distance from now (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @param {object} options - Options for formatting
 * @returns {string} Distance string
 */
export const formatDistanceToNow = (date, options = { addSuffix: true }) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return fnsFormatDistanceToNow(dateObj, options);
  } catch (error) {
    console.warn('Distance formatting error:', error);
    return 'Invalid date';
  }
};

/**
 * Format date for different display contexts
 */
export const formatters = {
  short: (date) => formatDate(date, 'PP'),
  long: (date) => formatDate(date, 'PPPp'),
  time: (date) => formatDate(date, 'p'),
  dateTime: (date) => formatDate(date, 'Pp'),
  iso: (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? dateObj.toISOString() : null;
  },
  timestamp: (date) => formatDate(date, 'yyyy-MM-dd HH:mm:ss'),
  friendly: (date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid date';
    
    const now = new Date();
    const diffInDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(date, 'PP');
  },
};

/**
 * Parse various date formats to Date object
 * @param {string|Date|number} input - Date input
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (input) => {
  try {
    if (!input) return null;
    
    if (input instanceof Date) {
      return isValid(input) ? input : null;
    }
    
    if (typeof input === 'number') {
      const date = new Date(input);
      return isValid(date) ? date : null;
    }
    
    if (typeof input === 'string') {
      // Try ISO format first
      const isoDate = parseISO(input);
      if (isValid(isoDate)) return isoDate;
      
      // Try native Date parsing
      const nativeDate = new Date(input);
      return isValid(nativeDate) ? nativeDate : null;
    }
    
    return null;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return null;
  }
};

/**
 * Check if a date is within a specific range
 * @param {Date} date - Date to check
 * @param {Date} start - Start of range
 * @param {Date} end - End of range
 * @returns {boolean} Whether date is in range
 */
export const isDateInRange = (date, start, end) => {
  try {
    const dateObj = parseDate(date);
    const startObj = parseDate(start);
    const endObj = parseDate(end);
    
    if (!dateObj || !startObj || !endObj) return false;
    
    return dateObj >= startObj && dateObj <= endObj;
  } catch (error) {
    console.warn('Date range check error:', error);
    return false;
  }
};

/**
 * Get common date ranges
 */
export const getDateRanges = () => {
  const now = new Date();
  
  return {
    today: {
      start: startOfDay(now),
      end: endOfDay(now),
      label: 'Today',
    },
    yesterday: {
      start: startOfDay(subDays(now, 1)),
      end: endOfDay(subDays(now, 1)),
      label: 'Yesterday',
    },
    last7Days: {
      start: startOfDay(subDays(now, 7)),
      end: endOfDay(now),
      label: 'Last 7 days',
    },
    last30Days: {
      start: startOfDay(subDays(now, 30)),
      end: endOfDay(now),
      label: 'Last 30 days',
    },
    lastWeek: {
      start: startOfDay(subWeeks(now, 1)),
      end: endOfDay(subWeeks(now, 1)),
      label: 'Last week',
    },
    lastMonth: {
      start: startOfDay(subMonths(now, 1)),
      end: endOfDay(subMonths(now, 1)),
      label: 'Last month',
    },
  };
};

/**
 * Create a date range filter function
 * @param {string} rangeKey - Key from getDateRanges()
 * @returns {function} Filter function
 */
export const createDateRangeFilter = (rangeKey) => {
  const ranges = getDateRanges();
  const range = ranges[rangeKey];
  
  if (!range) {
    console.warn(`Unknown date range: ${rangeKey}`);
    return () => true;
  }
  
  return (item, dateField = 'createdAt') => {
    const itemDate = parseDate(item[dateField]);
    return itemDate && isDateInRange(itemDate, range.start, range.end);
  };
};

/**
 * Format duration between two dates
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} Formatted duration
 */
export const formatDuration = (start, end) => {
  try {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    
    if (!startDate || !endDate) return 'Invalid duration';
    
    const diffMs = Math.abs(endDate - startDate);
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else {
      return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.warn('Duration formatting error:', error);
    return 'Invalid duration';
  }
};

/**
 * Get timezone-aware current time
 * @returns {object} Current time info
 */
export const getCurrentTimeInfo = () => {
  const now = new Date();
  
  return {
    local: now,
    utc: new Date(now.getTime() + (now.getTimezoneOffset() * 60000)),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: now.getTimezoneOffset(),
    iso: now.toISOString(),
    timestamp: now.getTime(),
  };
};

/**
 * Validate if a date string is in correct format
 * @param {string} dateString - Date string to validate
 * @param {string} expectedFormat - Expected format pattern
 * @returns {boolean} Whether date matches format
 */
export const validateDateFormat = (dateString, expectedFormat = 'yyyy-MM-dd') => {
  try {
    if (!dateString || typeof dateString !== 'string') return false;
    
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return false;
    
    const formattedBack = format(parsedDate, expectedFormat);
    return formattedBack === dateString;
  } catch (error) {
    return false;
  }
}; 
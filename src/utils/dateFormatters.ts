/**
 * Date formatting utilities
 * Centralized date/time formatting functions to avoid code duplication
 */

/**
 * Format date to readable format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format time to readable format
 * @param dateString - ISO date string or Date object
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid Time';
  }
};

/**
 * Format date and time together
 * @param dateString - ISO date string or Date object
 * @returns Formatted datetime string (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';

  const date = formatDate(dateString);
  const time = formatTime(dateString);

  if (date === 'Invalid Date' || time === 'Invalid Time') {
    return 'Invalid DateTime';
  }

  return `${date} at ${time}`;
};

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range (e.g., "Jan 15 - Jan 20, 2024")
 */
export const formatDateRange = (
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null
): string => {
  if (!startDate || !endDate) return 'N/A';

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid Date Range';
    }

    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // If same month, show: "Jan 15 - 20, 2024"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startFormatted} - ${end.getDate()}, ${end.getFullYear()}`;
    }

    // Different months: "Jan 15 - Feb 20, 2024"
    return `${startFormatted} - ${endFormatted}`;
  } catch {
    return 'Invalid Date Range';
  }
};

/**
 * Format date to ISO string for API
 * @param date - Date object
 * @returns ISO string (e.g., "2024-01-15T00:00:00.000Z")
 */
export const toISOString = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  try {
    return date.toISOString();
  } catch {
    return null;
  }
};

/**
 * Check if date is in the past
 * @param dateString - ISO date string or Date object
 * @returns true if date is in the past
 */
export const isPastDate = (dateString: string | Date | undefined | null): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date.getTime() < Date.now();
  } catch {
    return false;
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const isPast = diff < 0;
    const suffix = isPast ? 'ago' : 'from now';

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${suffix}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${suffix}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ${suffix}`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ${suffix}`;
  } catch {
    return 'Invalid Date';
  }
};

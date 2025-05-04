/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Format a currency value
 * @param value The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
};

/**
 * Format a percentage value
 * @param value The percentage value (0-100)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

/**
 * Format a number with thousands separators
 * @param value The number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a duration in days
 * @param days The number of days
 * @returns Formatted duration string
 */
export const formatDuration = (days: number): string => {
  if (days < 1) {
    return 'Less than a day';
  }
  
  if (days === 1) {
    return '1 day';
  }
  
  if (days < 30) {
    return `${days} days`;
  }
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  if (months === 1) {
    if (remainingDays === 0) {
      return '1 month';
    }
    return `1 month, ${remainingDays} days`;
  }
  
  if (remainingDays === 0) {
    return `${months} months`;
  }
  
  return `${months} months, ${remainingDays} days`;
}; 
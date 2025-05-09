import { format, isToday, isYesterday, isThisYear } from 'date-fns';

/**
 * Format a date for display in a message list
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - This year: "January 15"
 * - Previous years: "January 15, 2022"
 */
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  if (isThisYear(date)) {
    return format(date, 'MMMM d');
  }
  
  return format(date, 'MMMM d, yyyy');
}

/**
 * Format a date and time for display
 * @param date The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format a time for display
 * @param date The date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

/**
 * Get a friendly relative time
 * @param date The date to format
 * @returns Friendly relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return format(date, 'MMM d');
} 
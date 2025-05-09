// Declare missing modules
declare module '@fullcalendar/common';

// Extend existing types
declare namespace React {
  interface FunctionComponent {
    loading?: boolean;
  }
}

// Fix for Canvas related issues
interface Card {
  filter: (predicate: (value: Card, index: number, array: Card[]) => boolean) => Card[];
}

// Utility interface declarations
interface Notification {
  sender?: {
    name?: string;
  };
}

// Extend UseNotificationsReturn
interface UseNotificationsReturn {
  deleteNotification?: (id: string) => void;
}

// Declare formatDate to accept boolean second parameter
declare function formatDate(date: string, includeTime?: boolean): string;

// Auth context extensions
interface AuthContext {
  loading?: boolean;
}

// API extension
interface ApiGoals {
  getAllGoals: () => Promise<any>;
} 
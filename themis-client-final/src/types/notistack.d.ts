declare module 'notistack' {
  import * as React from 'react';

  export interface SnackbarMessage {
    message: React.ReactNode;
    options?: OptionsObject;
    dismissed?: boolean;
  }

  export interface OptionsObject {
    key?: string | number;
    variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
    autoHideDuration?: number;
    preventDuplicate?: boolean;
    onClose?: () => void;
    action?: React.ReactNode;
    anchorOrigin?: {
      horizontal: 'left' | 'center' | 'right';
      vertical: 'top' | 'bottom';
    };
    [key: string]: any;
  }

  export interface SnackbarProviderProps {
    children: React.ReactNode;
    maxSnack?: number;
    preventDuplicate?: boolean;
    autoHideDuration?: number;
    hideIconVariant?: boolean;
    dense?: boolean;
    classes?: { [key: string]: string };
    anchorOrigin?: {
      horizontal: 'left' | 'center' | 'right';
      vertical: 'top' | 'bottom';
    };
    [key: string]: any;
  }

  export const SnackbarProvider: React.FC<SnackbarProviderProps>;
} 
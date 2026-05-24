'use client';

import { toast as hotToast, ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 3000,
};

function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function getToastStyles() {
  const dark = isDarkMode();
  if (dark) {
    return {
      success: {
        style: {
          borderRadius: '12px',
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#f1f5f9',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
      },
      error: {
        style: {
          borderRadius: '12px',
          background: 'rgba(127, 29, 29, 0.95)',
          color: '#fef2f2',
          border: '1px solid rgba(185, 28, 28, 0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      },
      loading: {
        style: {
          borderRadius: '12px',
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#f1f5f9',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          backdropFilter: 'blur(12px)',
        },
        iconTheme: { primary: '#3b82f6', secondary: '#fff' },
      },
    };
  }
  return {
    success: {
      style: {
        borderRadius: '12px',
        background: '#ffffff',
        color: '#166534',
        border: '1px solid #bbf7d0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      iconTheme: { primary: '#16a34a', secondary: '#fff' },
    },
    error: {
      style: {
        borderRadius: '12px',
        background: '#ffffff',
        color: '#991b1b',
        border: '1px solid #fecaca',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      iconTheme: { primary: '#dc2626', secondary: '#fff' },
    },
    loading: {
      style: {
        borderRadius: '12px',
        background: '#ffffff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      iconTheme: { primary: '#3b82f6', secondary: '#fff' },
    },
  };
}

export const toast = {
  ...hotToast,
  success: (message: string, opts?: ToastOptions) => {
    const styles = getToastStyles();
    return hotToast.success(message, { ...defaultOptions, ...opts, ...styles.success });
  },
  error: (message: string, opts?: ToastOptions) => {
    const styles = getToastStyles();
    return hotToast.error(message, { ...defaultOptions, duration: 5000, ...opts, ...styles.error });
  },
  loading: (message: string, opts?: ToastOptions) => {
    const styles = getToastStyles();
    return hotToast.loading(message, { ...defaultOptions, duration: Infinity, ...opts, ...styles.loading });
  },
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: (err: any) => string },
    opts?: ToastOptions
  ): Promise<T> => {
    const styles = getToastStyles();
    return hotToast.promise(promise, msgs, { ...defaultOptions, ...opts, ...styles.loading });
  },
  dismiss: hotToast.dismiss,
  remove: hotToast.remove,
};

export default toast;

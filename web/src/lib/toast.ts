'use client';

import { toast as hotToast, ToastOptions } from 'react-hot-toast';

export type ToastStyle = 'modern-dark' | 'clean-light' | 'teal-accent' | 'neumorphic' | 'minimal';

interface ToastStyleConfig {
  success: {
    icon: string;
    style: React.CSSProperties;
  };
  error: {
    icon: string;
    style: React.CSSProperties;
  };
  loading: {
    icon: string;
    style: React.CSSProperties;
  };
}

const toastStyles: Record<ToastStyle, ToastStyleConfig> = {
  'modern-dark': {
    success: {
      icon: '✓',
      style: {
        borderRadius: '12px',
        background: 'rgba(30, 41, 59, 0.95)',
        color: '#f8fafc',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
    },
    error: {
      icon: '✕',
      style: {
        borderRadius: '12px',
        background: 'rgba(127, 29, 29, 0.95)',
        color: '#fef2f2',
        border: '1px solid rgba(185, 28, 28, 0.5)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
    },
    loading: {
      icon: '◐',
      style: {
        borderRadius: '12px',
        background: 'rgba(30, 41, 59, 0.95)',
        color: '#f8fafc',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        backdropFilter: 'blur(12px)',
      },
    },
  },
  'clean-light': {
    success: {
      icon: '✓',
      style: {
        borderRadius: '8px',
        background: '#ffffff',
        color: '#166534',
        border: '1px solid #bbf7d0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
    error: {
      icon: '✕',
      style: {
        borderRadius: '8px',
        background: '#ffffff',
        color: '#991b1b',
        border: '1px solid #fecaca',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
    loading: {
      icon: '◐',
      style: {
        borderRadius: '8px',
        background: '#ffffff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  'teal-accent': {
    success: {
      icon: '✓',
      style: {
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 10px 15px -3px rgba(20, 184, 166, 0.3), 0 4px 6px -4px rgba(20, 184, 166, 0.2)',
      },
    },
    error: {
      icon: '✕',
      style: {
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.3), 0 4px 6px -4px rgba(225, 29, 72, 0.2)',
      },
    },
    loading: {
      icon: '◐',
      style: {
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  'neumorphic': {
    success: {
      icon: '✓',
      style: {
        borderRadius: '20px',
        background: '#e0e5ec',
        color: '#4b5563',
        border: 'none',
        boxShadow: '8px 8px 16px #c8ccd4, -8px -8px 16px #ffffff',
      },
    },
    error: {
      icon: '✕',
      style: {
        borderRadius: '20px',
        background: '#e0e5ec',
        color: '#4b5563',
        border: 'none',
        boxShadow: '8px 8px 16px #c8ccd4, -8px -8px 16px #ffffff',
      },
    },
    loading: {
      icon: '◐',
      style: {
        borderRadius: '20px',
        background: '#e0e5ec',
        color: '#4b5563',
        border: 'none',
        boxShadow: '8px 8px 16px #c8ccd4, -8px -8px 16px #ffffff',
      },
    },
  },
  'minimal': {
    success: {
      icon: '',
      style: {
        borderRadius: '4px',
        background: 'transparent',
        color: '#16a34a',
        border: 'none',
        boxShadow: 'none',
      },
    },
    error: {
      icon: '',
      style: {
        borderRadius: '4px',
        background: 'transparent',
        color: '#dc2626',
        border: 'none',
        boxShadow: 'none',
      },
    },
    loading: {
      icon: '',
      style: {
        borderRadius: '4px',
        background: 'transparent',
        color: '#6b7280',
        border: 'none',
        boxShadow: 'none',
      },
    },
  },
};

const defaultOptions: ToastOptions = {
  duration: 3000,
};

export function getToastStyle(): ToastStyle {
  if (typeof window === 'undefined') return 'modern-dark';
  return (localStorage.getItem('islandhub-toast-style') as ToastStyle) || 'modern-dark';
}

export function setToastStyle(style: ToastStyle) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('islandhub-toast-style', style);
  }
}

export const toast = {
  ...hotToast,
  success: (message: string, opts?: ToastOptions): string | undefined => {
    const style = getToastStyle();
    const config = toastStyles[style];
    return hotToast.success(message, { ...defaultOptions, ...opts, style: config.success.style });
  },
  error: (message: string, opts?: ToastOptions): string | undefined => {
    const style = getToastStyle();
    const config = toastStyles[style];
    return hotToast.error(message, { ...defaultOptions, duration: 5000, ...opts, style: config.error.style });
  },
  loading: (message: string, opts?: ToastOptions): string | undefined => {
    const style = getToastStyle();
    const config = toastStyles[style];
    return hotToast.loading(message, { ...defaultOptions, duration: Infinity, ...opts, style: config.loading.style });
  },
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: (err: any) => string;
    },
    opts?: ToastOptions
  ): Promise<T> => {
    const style = getToastStyle();
    const config = toastStyles[style];
    return hotToast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
      style: { ...config.loading.style, ...opts?.style },
      ...opts,
    });
  },
};

export default toast;

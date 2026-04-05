'use client';

import { useEffect, useState } from 'react';
import { Toaster as ReactHotToaster } from 'react-hot-toast';
import { getToastStyle, ToastStyle } from '@/lib/toast';

function Toaster() {
  const [style, setStyle] = useState<ToastStyle>('modern-dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStyle(getToastStyle());
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toastOptions = {
    'modern-dark': {
      style: {
        borderRadius: '12px',
        background: 'rgba(30, 41, 59, 0.95)',
        color: '#f8fafc',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      success: {
        style: {
          borderRadius: '12px',
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#f8fafc',
          border: '1px solid rgba(51, 65, 85, 0.5)',
        },
        iconTheme: { primary: '#22c55e', secondary: '#fff' },
      },
      error: {
        style: {
          borderRadius: '12px',
          background: 'rgba(127, 29, 29, 0.95)',
          color: '#fef2f2',
          border: '1px solid rgba(185, 28, 28, 0.5)',
        },
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      },
    },
    'clean-light': {
      style: {
        borderRadius: '8px',
        background: '#ffffff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      success: {
        style: {
          borderRadius: '8px',
          background: '#ffffff',
          color: '#166534',
          border: '1px solid #bbf7d0',
        },
        iconTheme: { primary: '#16a34a', secondary: '#fff' },
      },
      error: {
        style: {
          borderRadius: '8px',
          background: '#ffffff',
          color: '#991b1b',
          border: '1px solid #fecaca',
        },
        iconTheme: { primary: '#dc2626', secondary: '#fff' },
      },
    },
    'teal-accent': {
      style: {
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
      },
      success: {
        style: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          color: '#ffffff',
          border: 'none',
        },
        iconTheme: { primary: '#fff', secondary: '#0d9488' },
      },
      error: {
        style: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
          color: '#ffffff',
          border: 'none',
        },
        iconTheme: { primary: '#fff', secondary: '#be123c' },
      },
    },
    'neumorphic': {
      style: {
        borderRadius: '20px',
        background: '#e0e5ec',
        color: '#4b5563',
        border: 'none',
        boxShadow: '8px 8px 16px #c8ccd4, -8px -8px 16px #ffffff',
      },
      success: {
        style: {
          borderRadius: '20px',
          background: '#e0e5ec',
          color: '#4b5563',
          border: 'none',
        },
        iconTheme: { primary: '#16a34a', secondary: '#fff' },
      },
      error: {
        style: {
          borderRadius: '20px',
          background: '#e0e5ec',
          color: '#4b5563',
          border: 'none',
        },
        iconTheme: { primary: '#dc2626', secondary: '#fff' },
      },
    },
    'minimal': {
      style: {
        borderRadius: '4px',
        background: 'transparent',
        color: '#374151',
        border: 'none',
        boxShadow: 'none',
      },
      success: {
        style: {
          borderRadius: '4px',
          background: 'transparent',
          color: '#16a34a',
          border: 'none',
        },
        iconTheme: { primary: '#16a34a', secondary: 'transparent' },
      },
      error: {
        style: {
          borderRadius: '4px',
          background: 'transparent',
          color: '#dc2626',
          border: 'none',
        },
        iconTheme: { primary: '#dc2626', secondary: 'transparent' },
      },
    },
  };

  const opts = toastOptions[style];

  return (
    <ReactHotToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        ...opts,
        error: {
          duration: 5000,
          ...opts.error,
        },
        loading: {
          duration: Infinity,
          ...opts,
        },
      }}
    />
  );
}

export default Toaster;
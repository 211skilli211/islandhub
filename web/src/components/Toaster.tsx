'use client';

import { useEffect, useState } from 'react';
import { Toaster as ReactHotToaster } from 'react-hot-toast';

function Toaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ReactHotToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
        },
        success: {
          style: {
            borderRadius: '12px',
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            backdropFilter: 'blur(12px)',
          },
          iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
        },
        error: {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: 'rgba(127, 29, 29, 0.95)',
            color: '#fef2f2',
            border: '1px solid rgba(185, 28, 28, 0.5)',
            backdropFilter: 'blur(12px)',
          },
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
        loading: {
          duration: Infinity,
          style: {
            borderRadius: '12px',
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            backdropFilter: 'blur(12px)',
          },
          iconTheme: { primary: '#3b82f6', secondary: '#fff' },
        },
      }}
    />
  );
}

export default Toaster;

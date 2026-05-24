'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const typeStyles = {
  success: 'bg-palm-600 text-white',
  error: 'bg-danger-600 text-white',
  warning: 'bg-sand-500 text-white',
  info: 'bg-brand-600 text-white',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-6 right-6 z-[200] flex items-center gap-3"
        >
          <div
            className={`
              px-5 py-3 rounded-xl shadow-xl
              flex items-center gap-3 min-w-[280px]
              ${typeStyles[type]}
            `}
          >
            <span className="text-lg font-bold">{typeIcons[type]}</span>
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-lg font-bold"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* Toast hook for easy usage */
export function useToast() {
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const showToast = React.useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), 4000);
    },
    []
  );

  return { toast, showToast, ToastComponent: () => (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.visible}
      onClose={() => setToast((t) => ({ ...t, visible: false }))}
    />
  )};
}

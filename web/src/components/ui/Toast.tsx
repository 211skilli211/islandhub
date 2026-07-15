'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const typeStyles = {
  success: 'bg-success-primary text-white border-success-primary/20',
  error: 'bg-danger-primary text-white border-danger-primary/20',
  warning: 'bg-warning-primary text-white border-warning-primary/20',
  info: 'bg-accent-primary text-white border-accent-primary/20',
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
              px-5 py-3 rounded-xl shadow-xl border
              flex items-center gap-3 min-w-[280px] max-w-md
              ${typeStyles[type]}
            `}
          >
            <span className="text-lg font-bold">{typeIcons[type]}</span>
            <p className="text-sm font-semibold flex-1">{message}</p>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-lg font-bold leading-none"
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

/* PromptModal - replaces native prompt() */
interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'password';
}

export function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  inputType = 'text',
}: PromptModalProps) {
  const [value, setValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showClose={false}>
      {message && <p className="text-body-sm text-theme-secondary mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border-primary bg-input text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:border-accent-primary/50"
          autoFocus
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-theme-secondary hover:bg-theme-tertiary rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors"
          >
            OK
          </button>
        </div>
      </form>
    </Modal>
  );
}
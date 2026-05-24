'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('islandhub-theme', theme);
    document.cookie = `islandhub-theme=${theme};path=/;max-age=31536000`;
  }
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('islandhub-theme') as Theme;
    if (saved === 'light' || saved === 'dark') return saved;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'islandhub-theme' && (value === 'light' || value === 'dark')) {
        return value as Theme;
      }
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return next;
    });
  }, []);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme: handleSetTheme,
  }), [theme, toggleTheme, handleSetTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {!mounted ? (
        <div className="min-h-screen bg-surface-primary" suppressHydrationWarning>
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

const defaultContext: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  return context ?? defaultContext;
}

export default ThemeProvider;

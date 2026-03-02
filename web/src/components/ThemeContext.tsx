'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// CSS variable definitions for both themes
const themeVariables = {
    light: {
        '--background-primary': '#ffffff',
        '--background-secondary': '#f8fafc',
        '--background-tertiary': '#f1f5f9',
        '--background-inverse': '#0f172a',

        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--text-tertiary': '#64748b',
        '--text-inverse': '#f8fafc',

        '--border-primary': '#e2e8f0',
        '--border-secondary': '#cbd5e1',
        '--border-tertiary': '#94a3b8',

        '--accent-primary': '#14b8a6',
        '--accent-secondary': '#0f766e',
        '--accent-muted': '#5eead4',

        '--danger-primary': '#dc2626',
        '--danger-secondary': '#b91c1c',

        '--success-primary': '#16a34a',
        '--success-secondary': '#15803d',

        '--warning-primary': '#d97706',
        '--warning-secondary': '#b45309',

        '--shadow-color': 'rgba(15, 23, 42, 0.1)',
        '--shadow-color-lg': 'rgba(15, 23, 42, 0.15)',

        '--card-bg': '#ffffff',
        '--card-border': '#e2e8f0',

        '--input-bg': '#ffffff',
        '--input-border': '#e2e8f0',
        '--input-focus-ring': 'rgba(20, 184, 166, 0.3)',

        '--overlay-bg': 'rgba(15, 23, 42, 0.5)',
    },
    dark: {
        '--background-primary': '#0f172a',
        '--background-secondary': '#1e293b',
        '--background-tertiary': '#334155',
        '--background-inverse': '#f8fafc',

        '--text-primary': '#f8fafc',
        '--text-secondary': '#cbd5e1',
        '--text-tertiary': '#94a3b8',
        '--text-inverse': '#0f172a',

        '--border-primary': '#334155',
        '--border-secondary': '#475569',
        '--border-tertiary': '#64748b',

        '--accent-primary': '#14b8a6',
        '--accent-secondary': '#0d9488',
        '--accent-muted': '#2dd4bf',

        '--danger-primary': '#ef4444',
        '--danger-secondary': '#dc2626',

        '--success-primary': '#22c55e',
        '--success-secondary': '#16a34a',

        '--warning-primary': '#f59e0b',
        '--warning-secondary': '#d97706',

        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
        '--shadow-color-lg': 'rgba(0, 0, 0, 0.4)',

        '--card-bg': '#1e293b',
        '--card-border': '#334155',

        '--input-bg': '#1e293b',
        '--input-border': '#334155',
        '--input-focus-ring': 'rgba(20, 184, 166, 0.4)',

        '--overlay-bg': 'rgba(0, 0, 0, 0.6)',
    },
};

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    const themeVars = themeVariables[theme];

    // Apply CSS variables
    Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Add/remove dark class for Tailwind dark: modifier support
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    // Store preference
    if (typeof window !== 'undefined') {
        localStorage.setItem('islandhub-theme', theme);
        document.cookie = `islandhub-theme=${theme};path=/;max-age=31536000`; // 1 year
    }
}

function getInitialTheme(): Theme {
    if (typeof window !== 'undefined') {
        // Check localStorage first
        const savedTheme = localStorage.getItem('islandhub-theme') as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            return savedTheme;
        }

        // Check cookies
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'islandhub-theme' && (value === 'light' || value === 'dark')) {
                return value as Theme;
            }
        }

        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Initialize theme on mount (client-side only to prevent hydration mismatch)
        const initialTheme = getInitialTheme();
        setThemeState(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, []);

    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setThemeState(newTheme);
        applyTheme(newTheme);
    }, [theme]);

    const handleSetTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
    }, []);

    // Always provide context value - even before mounted
    // This prevents "useTheme must be used within a ThemeProvider" errors
    const contextValue = useMemo(() => ({
        theme,
        toggleTheme,
        setTheme: handleSetTheme,
    }), [theme, toggleTheme, handleSetTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {/* Show loading state only if not mounted, but still provide context */}
            {!mounted ? (
                <div className="min-h-screen bg-white" suppressHydrationWarning>
                    {children}
                </div>
            ) : (
                children
            )}
        </ThemeContext.Provider>
    );
}

// Default theme context - provides safe defaults when used outside provider
const defaultContext: ThemeContextType = {
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { },
};

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);

    // Return default context instead of throwing error
    // This prevents crashes when components render before provider is mounted
    if (context === undefined) {
        return defaultContext;
    }

    return context;
}

// Theme-aware CSS classes helper (for use in stylesheets or inline styles)
export const getThemeVariable = (property: string): string => {
    if (typeof window === 'undefined') return 'transparent';
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim() || 'transparent';
};

// Hook for getting current theme variable value
export function useThemeVariable(property: string): string {
    const [value, setValue] = React.useState('transparent');

    useEffect(() => {
        const updateValue = () => {
            setValue(getThemeVariable(property));
        };

        // Initial value
        updateValue();

        // Create observer to detect theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateValue();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [property]);

    return value;
}

export default ThemeProvider;

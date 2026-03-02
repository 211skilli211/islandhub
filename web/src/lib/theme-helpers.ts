// Theme-aware CSS class helpers
// Use these classes instead of hardcoded Tailwind colors for theme consistency

/**
 * Get the appropriate background color class based on context
 */
export function getBgClass(context: 'primary' | 'secondary' | 'tertiary' | 'inverse'): string {
    const classes = {
        primary: 'bg-[var(--background-primary)]',
        secondary: 'bg-[var(--background-secondary)]',
        tertiary: 'bg-[var(--background-tertiary)]',
        inverse: 'bg-[var(--background-inverse)]',
    };
    return classes[context];
}

/**
 * Get the appropriate text color class based on context
 */
export function getTextClass(context: 'primary' | 'secondary' | 'tertiary' | 'inverse'): string {
    const classes = {
        primary: 'text-[var(--text-primary)]',
        secondary: 'text-[var(--text-secondary)]',
        tertiary: 'text-[var(--text-tertiary)]',
        inverse: 'text-[var(--text-inverse)]',
    };
    return classes[context];
}

/**
 * Get the appropriate border color class based on context
 */
export function getBorderClass(context: 'primary' | 'secondary' | 'tertiary'): string {
    const classes = {
        primary: 'border-[var(--border-primary)]',
        secondary: 'border-[var(--border-secondary)]',
        tertiary: 'border-[var(--border-tertiary)]',
    };
    return classes[context];
}

/**
 * Get accent color class
 */
export function getAccentClass(variant: 'primary' | 'secondary' | 'muted'): string {
    const classes = {
        primary: 'text-[var(--accent-primary)] bg-[var(--accent-primary)]',
        secondary: 'text-[var(--accent-secondary)] bg-[var(--accent-secondary)]',
        muted: 'text-[var(--accent-muted)] bg-[var(--accent-muted)]',
    };
    return classes[variant];
}

/**
 * Get danger color class
 */
export function getDangerClass(variant: 'primary' | 'secondary'): string {
    const classes = {
        primary: 'text-[var(--danger-primary)] bg-[var(--danger-primary)]',
        secondary: 'text-[var(--danger-secondary)] bg-[var(--danger-secondary)]',
    };
    return classes[variant];
}

/**
 * Get success color class
 */
export function getSuccessClass(variant: 'primary' | 'secondary'): string {
    const classes = {
        primary: 'text-[var(--success-primary)] bg-[var(--success-primary)]',
        secondary: 'text-[var(--success-secondary)] bg-[var(--success-secondary)]',
    };
    return classes[variant];
}

/**
 * Get card styles
 */
export function getCardClasses(): string {
    return 'bg-[var(--card-bg)] border border-[var(--card-border)]';
}

/**
 * Get input styles
 */
export function getInputClasses(): string {
    return 'bg-[var(--input-bg)] border border-[var(--input-border)] focus:border-[var(--accent-primary)] focus:ring-[var(--input-focus-ring)]';
}

/**
 * Get shadow class
 */
export function getShadowClass(size: 'sm' | 'md' | 'lg' | 'xl'): string {
    const shadows = {
        sm: 'shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
        md: 'shadow-[var(--shadow-color)]',
        lg: 'shadow-[var(--shadow-color-lg)]',
        xl: 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
    };
    return shadows[size];
}

/**
 * Combine multiple theme classes
 */
export function cnTheme(...classes: string[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Common component patterns
 */

// Section wrapper with theme-aware background
export function getSectionClasses(variant: 'primary' | 'secondary' | 'tertiary' | 'transparent'): string {
    const classes = {
        primary: 'bg-[var(--background-primary)]',
        secondary: 'bg-[var(--background-secondary)]',
        tertiary: 'bg-[var(--background-tertiary)]',
        transparent: 'bg-transparent',
    };
    return cnTheme(classes[variant], 'theme-transition');
}

// Card component base styles
export function getCardBaseClasses(padded: boolean = true): string {
    return cnTheme(
        'bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl',
        padded ? 'p-6' : '',
        'theme-transition'
    );
}

// Button base styles
export function getButtonClasses(variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success'): string {
    const base = 'inline-flex items-center justify-center px-6 py-3 font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 theme-transition';

    const variants = {
        primary: 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] focus:ring-[var(--accent-primary)]',
        secondary: 'bg-[var(--background-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] focus:ring-[var(--border-secondary)]',
        outline: 'border-2 border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)] focus:ring-[var(--accent-primary)]',
        ghost: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-secondary)] focus:ring-[var(--border-secondary)]',
        success: 'bg-[var(--success-primary)] text-white hover:bg-[var(--success-secondary)] focus:ring-[var(--success-primary)]',
    };

    return cnTheme(base, variants[variant]);
}

// Link styles
export function getLinkClasses(variant: 'primary' | 'secondary'): string {
    const variants = {
        primary: 'text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] underline-offset-2 hover:underline',
        secondary: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    };
    return cnTheme('transition-colors', variants[variant]);
}

// Badge styles
export function getBadgeClasses(variant: 'default' | 'success' | 'warning' | 'danger'): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    const variants = {
        default: 'bg-[var(--background-tertiary)] text-[var(--text-secondary)]',
        success: 'bg-[var(--success-primary)]/10 text-[var(--success-primary)]',
        warning: 'bg-[var(--warning-primary)]/10 text-[var(--warning-primary)]',
        danger: 'bg-[var(--danger-primary)]/10 text-[var(--danger-primary)]',
    };

    return cnTheme(base, variants[variant]);
}

// Input field styles
export function getInputFieldClasses(): string {
    return cnTheme(
        'w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl',
        'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent',
        'theme-transition'
    );
}

// Divider styles
export function getDividerClasses(): string {
    return 'border-t border-[var(--border-primary)] theme-transition';
}

// Overlay styles
export function getOverlayClasses(): string {
    return 'fixed inset-0 bg-[var(--overlay-bg)] theme-transition';
}

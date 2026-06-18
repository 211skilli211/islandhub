import React from 'react';

interface RoleSwitcherProps {
    viewMode: 'buyer' | 'vendor' | 'driver';
    setViewMode: (mode: 'buyer' | 'vendor' | 'driver') => void;
    showDriverView?: boolean;
    showVendorView?: boolean;
}

export default function RoleSwitcher({ viewMode, setViewMode, showDriverView, showVendorView = true }: RoleSwitcherProps) {
    return (
        <div className="flex bg-surface-secondary p-1 rounded-xl">
            <button
                onClick={() => setViewMode('buyer')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'buyer' ? 'bg-surface-elevated text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'
                    }`}
            >
                Shopping
            </button>
            {showVendorView && (
                <button
                    onClick={() => setViewMode('vendor')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'vendor' ? 'bg-surface-elevated text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'
                        }`}
                >
                    Selling
                </button>
            )}
            {showDriverView && (
                <button
                    onClick={() => setViewMode('driver')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'driver' ? 'bg-surface-elevated text-ink-primary shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'
                        }`}
                >
                    Logistics
                </button>
            )}
        </div>
    );
}

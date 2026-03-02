import React from 'react';

interface RoleSwitcherProps {
    viewMode: 'buyer' | 'vendor' | 'driver';
    setViewMode: (mode: 'buyer' | 'vendor' | 'driver') => void;
    showDriverView?: boolean;
    showVendorView?: boolean;
}

export default function RoleSwitcher({ viewMode, setViewMode, showDriverView, showVendorView = true }: RoleSwitcherProps) {
    return (
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
                onClick={() => setViewMode('buyer')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'buyer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
            >
                Shopping
            </button>
            {showVendorView && (
                <button
                    onClick={() => setViewMode('vendor')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'vendor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    Selling
                </button>
            )}
            {showDriverView && (
                <button
                    onClick={() => setViewMode('driver')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'driver' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    Logistics
                </button>
            )}
        </div>
    );
}

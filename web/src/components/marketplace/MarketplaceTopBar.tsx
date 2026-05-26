'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Search, Bell, User, Plus, Menu, Home } from 'lucide-react';

interface MarketplaceTopBarProps {
    onMenuToggle: () => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
}

export default function MarketplaceTopBar({ onMenuToggle, searchQuery, onSearchChange, onSearchSubmit }: MarketplaceTopBarProps) {
    const { user, isAuthenticated } = useAuthStore();

    return (
        <div className="sticky top-0 z-30 bg-surface-elevated border-b border-border-primary shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left: Menu + Home + Logo */}
                    <div className="flex items-center gap-2">
                        <button onClick={onMenuToggle}
                            className="p-2 rounded-lg hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors lg:hidden"
                            aria-label="Toggle sidebar">
                            <Menu size={20} />
                        </button>
                        <Link href="/" className="p-2 rounded-lg hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors" aria-label="Back to Home">
                            <Home size={18} />
                        </Link>
                        <Link href="/listings" className="flex items-center gap-2">
                            <span className="text-lg">🏪</span>
                            <span className="font-bold text-sm text-ink-primary hidden sm:inline">IslandHub</span>
                        </Link>
                    </div>

                    {/* Center: Search */}
                    <form onSubmit={onSearchSubmit} className="flex-1 max-w-xl mx-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                            <input
                                type="text"
                                placeholder="Search Marketplace"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border-primary rounded-lg text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all"
                            />
                        </div>
                    </form>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <Link href="/listings/create"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-accent-500 text-white rounded-lg text-xs font-bold hover:bg-accent-600 transition-colors">
                            <Plus size={14} />
                            <span>Sell</span>
                        </Link>
                        {isAuthenticated && (
                            <button className="p-2 rounded-lg hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
                            </button>
                        )}
                        {user ? (
                            <Link href="/profile" className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={14} className="text-brand-400" />
                                )}
                            </Link>
                        ) : (
                            <Link href="/login" className="px-3 py-1.5 bg-accent-500 text-white rounded-lg text-xs font-bold hover:bg-accent-600 transition-colors">
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

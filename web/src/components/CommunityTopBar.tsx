'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import { Menu, Search, Plus, Bell, User } from 'lucide-react';

interface CommunityTopBarProps {
    onMenuToggle: () => void;
}

const COMMUNITY_NAV = [
    { href: '/community', label: 'Feed' },
    { href: '/community/groups', label: 'Groups' },
    { href: '/community/events', label: 'Events' },
    { href: '/community/marketplace', label: 'Marketplace' },
    { href: '/community/jobs', label: 'Jobs' },
    { href: '/community/stories', label: 'Stories' },
    { href: '/community/business', label: 'Business' },
    { href: '/community/auctions', label: 'Auctions' },
];

export default function CommunityTopBar({ onMenuToggle }: CommunityTopBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="sticky top-0 z-30 bg-surface-elevated border-b border-border-primary shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left: Menu + Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuToggle}
                            className="p-2 rounded-lg hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors"
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-lg">🏝️</span>
                            <span className="font-bold text-sm text-ink-primary hidden sm:inline">IslandHub</span>
                        </Link>
                    </div>

                    {/* Center: Nav links (desktop) */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {COMMUNITY_NAV.map(link => {
                            const active = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        active
                                            ? 'bg-accent-500/10 text-accent-500'
                                            : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Search + Actions */}
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="hidden sm:block">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 pl-9 pr-3 py-1.5 bg-surface-secondary border border-border-primary rounded-lg text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all"
                                />
                            </div>
                        </form>
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

            {/* Mobile nav scroll */}
            <div className="lg:hidden overflow-x-auto scrollbar-thin border-t border-border-primary/50">
                <div className="flex items-center gap-1 px-4 py-2">
                    {COMMUNITY_NAV.map(link => {
                        const active = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                                    active
                                        ? 'bg-accent-500 text-white'
                                        : 'bg-surface-secondary text-ink-secondary hover:text-ink-primary'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

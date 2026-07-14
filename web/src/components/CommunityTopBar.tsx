'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Menu, Search, Plus, Bell, User, X, ChevronDown } from 'lucide-react';

interface CommunityTopBarProps {
    onMenuToggle: () => void;
}

export default function CommunityTopBar({ onMenuToggle }: CommunityTopBarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/community/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setSearchExpanded(false);
        }
    };

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-30 bg-surface-elevated/95 backdrop-blur-xl border-b border-border-primary shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left: Logo + Menu */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuToggle}
                            className="p-2 rounded-xl hover:bg-surface-secondary text-secondary hover:text-primary transition-colors lg:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <Link href="/community" className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                                <span className="text-white text-xs font-black">IH</span>
                            </div>
                            <span className="text-base font-black text-primary tracking-tight hidden md:block">
                                Community
                            </span>
                        </Link>
                    </div>

                    {/* Center: Search */}
                    <div ref={searchRef} className="flex-1 max-w-md mx-2 sm:mx-4">
                        <form onSubmit={handleSearch} className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search community..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchExpanded(true)}
                                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border-primary rounded-xl text-sm text-primary placeholder:text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-400/50 transition-all"
                            />
                            {searchExpanded && searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(''); setSearchExpanded(false); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-secondary text-tertiary"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5">
                        {isAuthenticated ? (
                            <>
                                <Link href="/community/stories"
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-500/10 text-accent-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-500/20 transition-colors">
                                    <Plus size={14} />
                                    <span className="hidden md:inline">Create</span>
                                </Link>
                                <button className="relative p-2 rounded-xl hover:bg-surface-secondary text-secondary hover:text-primary transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-surface-elevated"></span>
                                </button>
                                <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 p-[2px] shrink-0 ml-1">
                                    <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={14} className="text-accent-400" />
                                        )}
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login"
                                    className="px-4 py-1.5 text-sm font-bold text-primary hover:bg-surface-secondary rounded-xl transition-colors">
                                    Log in
                                </Link>
                                <Link href="/register"
                                    className="px-4 py-1.5 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
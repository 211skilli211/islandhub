'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useTheme } from '@/components/ThemeContext';
import { getImageUrl } from '@/lib/api';

export default function UserProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    // Generate a consistent gradient color based on email
    const getAvatarGradient = (email: string) => {
        const gradients = [
            'from-teal-400 to-teal-600',
            'from-blue-400 to-blue-600',
            'from-violet-400 to-violet-600',
            'from-pink-400 to-rose-500',
            'from-orange-400 to-amber-500',
            'from-emerald-400 to-emerald-600',
        ];
        const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradients[hash % gradients.length];
    };

    const initials = user.name
        ?.split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    const gradient = getAvatarGradient(user.email || '');

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar-only trigger button */}
            <button
                id="profile-avatar-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="relative focus:outline-none group"
                aria-label="Profile menu"
                aria-expanded={isOpen}
            >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white bg-linear-to-br ${gradient} shadow-md ring-2 ring-white group-hover:ring-teal-400 transition-all duration-200 overflow-hidden`}>
                    {user.avatar_url ? (
                        <img
                            src={getImageUrl(user.avatar_url)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </button>

            {/* Dropdown panel — right-0 ensures it never clips off-screen right */}
            {isOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-60 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 z-[1100] animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                    {/* User header */}
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white bg-linear-to-br ${gradient} shadow-sm overflow-hidden flex-shrink-0`}>
                            {user.avatar_url ? (
                                <img src={getImageUrl(user.avatar_url)} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-black text-slate-900 truncate">{user.name}</div>
                            <div className="text-xs text-slate-500 truncate">{user.email}</div>
                            {user.role && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-700">
                                    {user.role}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                        <Link
                            href={`/users/${user.id}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                        </Link>

                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>

                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Link>

                        <Link
                            href="/dashboard/messages"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Inboxes
                        </Link>

                        {user.role === 'user' && (
                            <Link
                                href="/become-vendor"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Become a Vendor
                            </Link>
                        )}

                        {user.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Admin Panel
                            </Link>
                        )}
                    </div>

                    {/* Theme toggle */}
                    <div className="border-t border-slate-100">
                        <button
                            onClick={() => { toggleTheme(); setIsOpen(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <span className="text-base">☀️</span>
                                    Light Mode
                                </>
                            ) : (
                                <>
                                    <span className="text-base">🌙</span>
                                    Dark Mode
                                </>
                            )}
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100">
                        <button
                            onClick={() => { logout(); setIsOpen(false); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

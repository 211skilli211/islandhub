'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import UserProfileDropdown from './UserProfileDropdown';
import { useTheme } from '@/components/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { getImageUrl } from '@/lib/api';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [exploreOpen, setExploreOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    const { itemCount } = useCart();
    const router = useRouter();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="sticky top-0 bg-white shadow-md z-1000 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex">
                        <div className="shrink-0 flex items-center gap-2 group">
                            <Link href="/">
                                <span className="font-black text-2xl text-teal-600 transition-transform group-hover:scale-110">IslandHub 🌴</span>
                            </Link>

                            {/* Cart Icon with Badge */}
                            <button
                                onClick={() => setCartOpen(true)}
                                className="relative text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                            {/* Notification Bell - only when authenticated */}
                            {mounted && <NotificationCenter />}
                        </div>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8 items-center">

                            {/* Explore Dropdown */}
                            <div
                                className="relative flex h-full items-center"
                                onMouseEnter={() => window.innerWidth > 1024 && setExploreOpen(true)}
                                onMouseLeave={() => setExploreOpen(false)}
                            >
                                <button
                                    onClick={() => setExploreOpen(!exploreOpen)}
                                    className="border-transparent text-slate-500 hover:text-teal-600 inline-flex items-center px-1 pt-1 border-b-4 hover:border-teal-500 text-sm font-bold uppercase tracking-widest transition-all focus:outline-none h-full"
                                >
                                    Explore ▾
                                </button>
                                {exploreOpen && (
                                    <div className="absolute left-0 top-[76px] w-56 bg-white rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 py-4 z-1001 text-left px-2">
                                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Marketplace</div>
                                        <Link href="/stores?category=food" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                                            <span className="text-lg">🍴</span> Food & Dining
                                        </Link>
                                        <Link href="/stores?category=product" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all">
                                            <span className="text-lg">📦</span> Local Shopping
                                        </Link>
                                        <Link href="/stores?category=service" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all">
                                            <span className="text-lg">🛠</span> Services
                                        </Link>

                                        <div className="my-2 border-t border-slate-50" />

                                        {/* Simplified Tour Hub Link */}
                                        <Link href="/tours" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all">
                                            <span className="text-lg">🗺️</span> Tour Hub
                                        </Link>

                                        {/* Simplified Rental Hub Link */}
                                        <Link href="/rental-hub" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                                            <span className="text-lg">⚓</span> Rental Hub
                                        </Link>


                                        <div className="my-2 border-t border-slate-50" />

                                        {/* Taxi Hub Link */}
                                        <Link href="/request-ride?type=taxi" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-yellow-50 hover:text-yellow-600 rounded-xl transition-all">
                                            <span className="text-lg">🚖</span> Taxi Hub
                                        </Link>

                                        <div className="my-2 border-t border-slate-50" />

                                        <div className="my-2 border-t border-slate-50" />
                                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Impact</div>
                                        <Link href="/campaigns" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                                            <span className="text-lg">❤️</span> Campaigns
                                        </Link>
                                        <Link href="/community" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all">
                                            <span className="text-lg">🏝</span> Community
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Resources Dropdown */}
                            <div
                                className="relative flex h-full items-center"
                                onMouseEnter={() => window.innerWidth > 1024 && setResourcesOpen(true)}
                                onMouseLeave={() => setResourcesOpen(false)}
                            >
                                <button
                                    onClick={() => setResourcesOpen(!resourcesOpen)}
                                    className="border-transparent text-slate-500 hover:text-teal-600 inline-flex items-center px-1 pt-1 border-b-4 hover:border-teal-500 text-sm font-bold uppercase tracking-widest transition-all focus:outline-none h-full"
                                >
                                    Resources ▾
                                </button>
                                {resourcesOpen && (
                                    <div className="absolute left-0 top-[76px] w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 py-2 z-1001 text-center">
                                        <Link href="/pricing" className="block px-4 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">Pricing & Tiers</Link>
                                        <Link href="/how-it-works" className="block px-4 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">How it Works</Link>
                                        <Link href="/about" className="block px-4 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">About Us</Link>
                                        <Link href="/contact" className="block px-4 py-2 text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors">Contact</Link>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-6">
                        {/* Global Search */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                                if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
                            }}
                            className="relative mx-4 text-gray-400 focus-within:text-gray-600"
                        >
                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                id="global-search"
                                name="search"
                                className="block w-full bg-slate-100 border-transparent py-2 pl-10 pr-3 rounded-full border text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-teal-500/30 focus:ring-4 focus:ring-teal-500/5 sm:text-sm transition-all min-w-[200px]"
                                placeholder="Search the island..."
                                type="search"
                            />
                        </form>
                        {mounted && (
                            isAuthenticated ? (
                                <>
                                    <Link
                                        href="/start"
                                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                                    >
                                        <span>+</span> Create
                                    </Link>
                                    <UserProfileDropdown />
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-slate-500 hover:text-teal-600 px-3 py-2 text-sm font-bold uppercase tracking-widest transition-all">
                                        Log in
                                    </Link>
                                    <Link href="/register" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-teal-100 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                        Join Now
                                    </Link>
                                </>
                            )
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-3 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none transition-all"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu - Side Drawer */}
            {
                isOpen && (
                    <div className="fixed inset-0 z-100 sm:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsOpen(false)}
                        ></div>

                        {/* Drawer Content */}
                        <div className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl flex flex-col animate-slide-left overflow-y-auto">
                            <div className="p-6 flex justify-between items-center border-b border-slate-50">
                                <span className="font-black text-xl text-teal-600">IslandHub 🌴</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 py-6 px-4 space-y-2">
                                {/* Mobile Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 mb-4"
                                >
                                    <span className="font-bold text-slate-600 text-sm">Appearance</span>
                                    <div>
                                        {theme === 'dark' ? (
                                            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                                                <span>Light Mode</span> ☀️
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                <span>Dark Mode</span> 🌙
                                            </div>
                                        )}
                                    </div>
                                </button>

                                <Link
                                    href="/stores?category=food"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-3"
                                >
                                    <span>🍴</span> Food & Dining
                                </Link>
                                <Link
                                    href="/stores?category=product"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-all flex items-center gap-3"
                                >
                                    <span>📦</span> Shopping
                                </Link>
                                <Link
                                    href="/stores?category=service"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-3"
                                >
                                    <span>🛠</span> Services
                                </Link>
                                {/* Simplified Mobile Hub Links */}
                                <Link
                                    href="/tours"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-4 rounded-xl text-base font-black text-orange-600 bg-orange-50/50 transition-all flex items-center gap-3"
                                >
                                    <span>🗺️</span> Signature Tour Hub
                                </Link>

                                <Link
                                    href="/rental-hub"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-4 rounded-xl text-base font-black text-blue-600 bg-blue-50/50 transition-all flex items-center gap-3"
                                >
                                    <span>⚓</span> Island Rental Hub
                                </Link>

                                <Link
                                    href="/campaigns"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3"
                                >
                                    <span>❤️</span> Campaigns
                                </Link>
                                <Link
                                    href="/community"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition-all flex items-center gap-3"
                                >
                                    <span>🏝</span> Community
                                </Link>

                                <Link
                                    href="/pricing"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                >
                                    <span>🏷️</span> Pricing & Tiers
                                </Link>
                                <Link
                                    href="/how-it-works"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                >
                                    <span>📖</span> How it Works
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                >
                                    <span>🌿</span> About Us
                                </Link>
                                <Link
                                    href="/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-xl text-base font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                >
                                    <span>📧</span> Contact
                                </Link>

                                <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
                                    {isAuthenticated ? (
                                        <>
                                            <button
                                                onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                                                className="w-full text-left focus:outline-none"
                                            >
                                                <div className={`px-4 py-4 rounded-2xl transition-all cursor-pointer ${mobileProfileOpen ? 'bg-teal-50 ring-2 ring-teal-100' : 'bg-slate-50 hover:bg-slate-100'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-lg shadow-inner overflow-hidden border-2 border-white">
                                                                {user?.avatar_url ? (
                                                                    <img
                                                                        src={getImageUrl(user.avatar_url)}
                                                                        alt={user.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900 leading-tight">{user?.name}</div>
                                                                <div className="text-xs text-slate-500 font-bold tracking-tight">{user?.email}</div>
                                                            </div>
                                                        </div>
                                                        <svg className={`w-5 h-5 text-slate-400 transition-transform ${mobileProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </button>

                                            {mobileProfileOpen && (
                                                <div className="space-y-1 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <Link
                                                        href={`/users/${user?.id}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                                    >
                                                        <span>👤</span> My Profile
                                                    </Link>
                                                    <Link
                                                        href="/settings"
                                                        onClick={() => setIsOpen(false)}
                                                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                                    >
                                                        <span>⚙️</span> Settings
                                                    </Link>
                                                    <Link
                                                        href="/dashboard"
                                                        onClick={() => setIsOpen(false)}
                                                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                                    >
                                                        <span>📊</span> Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/messages"
                                                        onClick={() => setIsOpen(false)}
                                                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-all flex items-center gap-3"
                                                    >
                                                        <span>💬</span> Messages
                                                    </Link>
                                                    {user?.role === 'admin' && (
                                                        <Link
                                                            href="/admin"
                                                            onClick={() => setIsOpen(false)}
                                                            className="px-6 py-3 rounded-xl text-sm font-bold text-teal-600 bg-teal-50/50 hover:bg-teal-50 transition-all flex items-center gap-3"
                                                        >
                                                            <span>🛡️</span> Admin Panel
                                                        </Link>
                                                    )}
                                                    {user?.role === 'user' && (
                                                        <Link
                                                            href="/become-vendor"
                                                            onClick={() => setIsOpen(false)}
                                                            className="px-6 py-3 rounded-xl text-sm font-bold text-orange-600 bg-orange-50/50 hover:bg-orange-50 transition-all flex items-center gap-3"
                                                        >
                                                            <span>🚀</span> Become a Vendor/Host
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setIsOpen(false);
                                                        }}
                                                        className="w-full text-left px-6 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3"
                                                    >
                                                        <span>🚪</span> Log out
                                                    </button>
                                                </div>
                                            )}

                                            <Link
                                                href="/start"
                                                onClick={() => setIsOpen(false)}
                                                className="block px-4 py-4 rounded-2xl text-base font-black bg-teal-600 text-white text-center shadow-lg shadow-teal-100 active:scale-95 transition-transform"
                                            >
                                                + Start Something
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setIsOpen(false)}
                                                className="block px-4 py-4 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50 text-center border-2 border-slate-100"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsOpen(false)}
                                                className="block px-4 py-4 rounded-2xl text-base font-black bg-teal-600 text-white text-center shadow-lg shadow-teal-100 active:scale-95 transition-transform"
                                            >
                                                Join IslandHub
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Cart Drawer */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </nav >
    );
}

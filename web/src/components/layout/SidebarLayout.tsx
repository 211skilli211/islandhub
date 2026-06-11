'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';

interface SidebarLayoutProps {
    children: ReactNode;
    title?: string;
}

const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊', href: '/dashboard' },
    { id: 'orders', label: 'Orders', icon: '📦', href: '/dashboard?tab=orders' },
    { id: 'messages', label: 'Messages', icon: '💬', href: '/dashboard/messages' },
    { id: 'wallet', label: 'Wallet', icon: '💰', href: '/dashboard?tab=wallet' },
    { id: 'listings', label: 'My Listings', icon: '🏪', href: '/listings' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
];

const communityItems = [
    { id: 'community', label: 'Community', icon: '🌴', href: '/community' },
    { id: 'stories', label: 'Stories', icon: '📸', href: '/community/stories' },
    { id: 'groups', label: 'Groups', icon: '👥', href: '/community/groups' },
    { id: 'events', label: 'Events', icon: '🎉', href: '/community/events' },
    { id: 'auctions', label: 'Auctions', icon: '🔨', href: '/community/auctions' },
    { id: 'coops', label: 'Co-ops', icon: '🤝', href: '/community/coops' },
];

const adminItems = [
    { id: 'overview', label: 'Overview', icon: '📊', href: '/admin' },
    { id: 'users', label: 'Users', icon: '👥', href: '/admin/users' },
    { id: 'listings', label: 'Listings', icon: '📦', href: '/admin/listings' },
    { id: 'stores', label: 'Stores', icon: '🏪', href: '/admin/stores' },
    { id: 'orders', label: 'Orders', icon: '🛒', href: '/admin/orders' },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: '/admin/analytics' },
    { id: 'dispatch', label: 'Dispatch', icon: '🚗', href: '/admin/dispatch' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/admin/settings' },
];

export default function SidebarLayout({ children, title = 'Dashboard' }: SidebarLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
    const items = isAdmin ? adminItems : navItems;

    const isActive = (href: string) => {
        if (href.includes('?')) return pathname === href.split('?')[0];
        return pathname === href || pathname.startsWith(href + '/');
    };

    const handleLogout = () => {
        logout();
        router.push('/');
        toast.success('Logged out');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
                )}
            </AnimatePresence>

            {/* Sidebar — WHITE background */}
            <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'lg:w-20' : 'w-64'}`}>
                {/* Logo */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="text-2xl">🌴</span>
                        {!collapsed && <span className="font-black text-lg tracking-tight text-gray-900">IslandHub</span>}
                    </Link>
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        ✕
                    </button>
                </div>

                {/* User Card */}
                {user && !collapsed && (
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link href={item.href} onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                        ? 'bg-teal-50 text-teal-700 font-bold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    <span className="text-xl shrink-0">{item.icon}</span>
                                    {!collapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Community Section */}
                    {!collapsed && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Community</p>
                            <ul className="space-y-1 px-3">
                                {communityItems.map((item) => (
                                    <li key={item.id}>
                                        <Link href={item.href} onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isActive(item.href)
                                                ? 'bg-teal-50 text-teal-700 font-bold'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                                            <span className="text-lg shrink-0">{item.icon}</span>
                                            <span className="font-medium text-xs truncate">{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {collapsed && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <ul className="space-y-1 px-3">
                                {communityItems.slice(0, 3).map((item) => (
                                    <li key={item.id}>
                                        <Link href={item.href} onClick={() => setMobileOpen(false)}
                                            className={`flex items-center justify-center p-3 rounded-xl transition-all ${isActive(item.href)
                                                ? 'bg-teal-50 text-teal-700'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                            title={item.label}>
                                            <span className="text-lg">{item.icon}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* Collapse Toggle + Logout */}
                <div className="border-t border-gray-100 p-3 space-y-1 shrink-0">
                    <button onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full p-3 items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                        {collapsed ? '→' : '←'}
                    </button>
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors">
                        <span className="text-xl">🚪</span>
                        {!collapsed && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        ☰
                    </button>
                    <span className="font-black text-gray-900">{title}</span>
                    <div className="w-8" />
                </header>
                <div className="p-4 lg:p-8">{children}</div>
            </main>
        </div>
    );
}

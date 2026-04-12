'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';

const messagesNavItems = [
    { id: 'inbox', label: 'Inbox', icon: '📥', href: '/dashboard/messages' },
    { id: 'contacts', label: 'Contacts', icon: '👥', href: '/dashboard/contacts' },
];

export default function MessagesLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => pathname === href;

    const handleLogout = () => {
        logout();
        router.push('/');
        toast.success('Logged out');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } ${collapsed ? 'lg:w-20' : 'w-72'}`}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <span className="text-2xl">🌴</span>
                        {!collapsed && <span className="font-black text-lg tracking-tight">IslandHub</span>}
                    </Link>
                    <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
                        ✕
                    </button>
                </div>

                {user && !collapsed && (
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{user.name}</p>
                                <p className="text-xs text-slate-400">Messages</p>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {messagesNavItems.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                        isActive(item.href) 
                                            ? 'bg-teal-600 text-white shadow-lg' 
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {!collapsed && <span className="font-bold text-sm">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex p-4 border-t border-slate-800 items-center justify-center text-slate-400 hover:text-white"
                >
                    {collapsed ? '→' : '←'}
                </button>

                <div className="p-4 border-t border-slate-800">
                    <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white ${collapsed ? 'justify-center' : ''}`}>
                        <span className="text-xl">←</span>
                        {!collapsed && <span className="font-bold text-sm">Dashboard</span>}
                    </Link>
                </div>
            </aside>

            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">☰</button>
                    <span className="font-black text-slate-900">Messages</span>
                    <div className="w-8" />
                </header>
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
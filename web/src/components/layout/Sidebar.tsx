'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';

interface NavItem {
    id: string;
    label: string;
    icon: string;
    href?: string;
    badge?: number;
    subItems?: NavItem[];
}

interface SidebarProps {
    items: NavItem[];
    title?: string;
    logo?: string;
    onLogout?: () => void;
}

export default function Sidebar({ items, title = 'IslandHub', logo = '🌴', onLogout }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const toggleExpand = (id: string) => {
        setExpandedItem(expandedItem === id ? null : id);
    };

    return (
        <div className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 ${
            collapsed ? 'w-20' : 'w-72'
        }`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <span className="text-2xl">{logo}</span>
                            <span className="font-black text-lg tracking-tight">{title}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <span className="text-lg">{collapsed ? '→' : '←'}</span>
                </button>
            </div>

            {/* User Info */}
            {user && !collapsed && (
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {items.map((item) => {
                        const active = item.href ? isActive(item.href) : false;
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isExpanded = expandedItem === item.id;

                        return (
                            <li key={item.id}>
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            active 
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' 
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1 font-bold text-sm">{item.label}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => toggleExpand(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            isExpanded 
                                                ? 'bg-slate-800 text-white' 
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1 font-bold text-sm text-left">{item.label}</span>
                                                <span className="text-slate-500">{isExpanded ? '↑' : '↓'}</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Sub Items */}
                                {hasSubItems && isExpanded && !collapsed && (
                                    <ul className="ml-8 mt-1 space-y-1">
                                        {item.subItems?.map((subItem) => (
                                            <li key={subItem.id}>
                                                <Link
                                                    href={subItem.href || '#'}
                                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                                                        isActive(subItem.href || '')
                                                            ? 'text-teal-400 bg-slate-800' 
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <span>{subItem.icon}</span>
                                                    <span>{subItem.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
                    >
                        <span className="text-xl">🚪</span>
                        {!collapsed && <span className="font-bold text-sm">Logout</span>}
                    </button>
                )}
            </div>
        </div>
    );
}
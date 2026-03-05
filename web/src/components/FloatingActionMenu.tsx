'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { shouldShowFloatingChat } from '@/lib/agentConfig';

interface QuickAction {
    icon: string;
    label: string;
    href?: string;
    onClick?: () => void;
    color: string;
}

export default function FloatingActionMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();

    // Only show for logged in customers/guests, not on admin/vendor dashboards
    if (!user) return null;
    const isAdminOrVendorPage = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard/vendor');
    if (isAdminOrVendorPage) return null;
    if (user?.role && !shouldShowFloatingChat(user.role)) return null;

    const actions: QuickAction[] = [
        {
            icon: '🛒',
            label: 'Browse Market',
            href: '/marketplace',
            color: 'bg-teal-500 hover:bg-teal-600',
        },
        {
            icon: '📦',
            label: 'Track Order',
            href: '/dashboard/orders',
            color: 'bg-indigo-500 hover:bg-indigo-600',
        },
        {
            icon: '🌴',
            label: 'Tropical Pulse',
            onClick: () => {
                const marquee = document.querySelector('[data-marquee]');
                if (marquee) marquee.scrollIntoView({ behavior: 'smooth' });
            },
            color: 'bg-amber-500 hover:bg-amber-600',
        },
        {
            icon: '📣',
            label: 'Campaigns',
            href: '/campaigns',
            color: 'bg-rose-500 hover:bg-rose-600',
        },
        {
            icon: '🏪',
            label: 'Vendors',
            href: '/vendors',
            color: 'bg-purple-500 hover:bg-purple-600',
        },
        {
            icon: '❓',
            label: 'Help Center',
            href: '/resources/help',
            color: 'bg-sky-500 hover:bg-sky-600',
        },
    ];

    const handleAction = (action: QuickAction) => {
        setIsOpen(false);
        if (action.href) {
            router.push(action.href);
        } else if (action.onClick) {
            action.onClick();
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />

                        {/* Action Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-20 left-0 space-y-2 z-50"
                        >
                            {actions.map((action, i) => (
                                <motion.button
                                    key={action.label}
                                    initial={{ opacity: 0, x: -30, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -30, scale: 0.8 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                    onClick={() => handleAction(action)}
                                    className={`flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-2xl shadow-lg min-w-[180px] transition-all`}
                                >
                                    <span className="text-lg">{action.icon}</span>
                                    <span className="font-bold text-sm">{action.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* FAB Toggle */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-linear-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-slate-800 relative z-50"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </motion.div>
            </motion.button>
        </div>
    );
}

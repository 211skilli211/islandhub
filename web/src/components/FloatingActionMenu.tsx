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

interface FloatingActionMenuProps {
    hubMode?: boolean;
    onHubClose?: () => void;
}


export default function FloatingActionMenu({ hubMode = false, onHubClose }: FloatingActionMenuProps = {}) {
    const [isOpen, setIsOpen] = useState(hubMode);
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();

    // Only show for logged in customers/guests, not on admin/vendor dashboards
    if (!user) return null;
    const isAdminOrVendorPage = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard/vendor');

    // In hub mode, visibility is managed by the hub itself
    if (!hubMode) {
        if (isAdminOrVendorPage && user?.role !== 'admin' && user?.role !== 'super-admin') return null;
        if (user?.role && !shouldShowFloatingChat(user.role)) return null;
    }

    const actions: QuickAction[] = [
        {
            icon: '🛒',
            label: 'Browse Market',
            href: '/marketplace',
            color: 'bg-accent-500/100 hover:bg-accent-500',
        },
        {
            icon: '📦',
            label: 'Track Order',
            href: '/dashboard/orders',
            color: 'bg-[#14b8a6]/100 hover:bg-[#14b8a6]',
        },
        {
            icon: '🌴',
            label: 'Tropical Pulse',
            onClick: () => {
                const marquee = document.querySelector('[data-marquee]');
                if (marquee) marquee.scrollIntoView({ behavior: 'smooth' });
            },
            color: 'bg-sand-500/50 hover:bg-sand-500',
        },
        {
            icon: '📣',
            label: 'Campaigns',
            href: '/campaigns',
            color: 'bg-[#e11d48]/50 hover:bg-[#e11d48]',
        },
        {
            icon: '🏪',
            label: 'Vendors',
            href: '/vendors',
            color: 'bg-teal-500 hover:bg-teal-600',
        },
        {
            icon: '❓',
            label: 'Help Center',
            href: '/resources/help',
            color: 'bg-sky-500 hover:bg-sky-600',
        },
    ];

    const handleAction = (action: QuickAction) => {
        if (hubMode && onHubClose) {
            onHubClose();
        } else {
            setIsOpen(false);
        }

        if (action.href) {
            router.push(action.href);
        } else if (action.onClick) {
            action.onClick();
        }
    };

    return (
        <div className={hubMode ? "" : "fixed bottom-24 lg:bottom-6 left-6 z-9999"}>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {!hubMode && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            />
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`${hubMode ? "absolute bottom-0 right-0 z-50 mb-2" : "absolute bottom-20 left-0 space-y-2 z-50"}`}
                        >
                            <div className="flex flex-col gap-2 items-end">
                                {actions.map((action, i) => (
                                    <motion.button
                                        key={action.label}
                                        initial={{ opacity: 0, x: hubMode ? 30 : -30, scale: 0.8 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: hubMode ? 30 : -30, scale: 0.8 }}
                                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                        onClick={() => handleAction(action)}
                                        className={`flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-2xl shadow-lg min-w-[180px] transition-all`}
                                    >
                                        <span className="text-lg">{action.icon}</span>
                                        <span className="font-bold text-sm">{action.label}</span>
                                    </motion.button>
                                ))}
                                {hubMode && (
                                    <button
                                        onClick={onHubClose}
                                        className="mt-2 w-full py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-tertiary0 dark:text-ink-tertiary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-tertiary dark:hover:bg-surface-tertiary transition-colors"
                                    >
                                        Back to Hub
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {!hubMode && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-border-primary relative z-50"
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
            )}
        </div>
    );
}

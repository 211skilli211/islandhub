'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Notification {
    id: number;
    type: string;
    title: string;
    message?: string;
    is_read: boolean;
    created_at: string;
}

const typeIcon: Record<string, string> = {
    order: '🛒',
    payment: '💳',
    message: '💬',
    review: '⭐',
    payout: '💰',
    system: '🔔',
    general: '📢',
};

function formatDate(str: string) {
    return new Date(str).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export default function NotificationsPage() {
    const { token, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const fetchPage = useCallback(async (offset: number, replace = false) => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/notifications?limit=${PAGE_SIZE}&offset=${offset}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const items: Notification[] = data.notifications || [];
                setNotifications(prev => replace ? items : [...prev, ...items]);
                setUnreadCount(data.unread_count || 0);
                setHasMore(items.length === PAGE_SIZE);
            }
        } catch { /* graceful */ }
        finally { setLoading(false); }
    }, [token]);

    useEffect(() => {
        fetchPage(0, true);
    }, [fetchPage]);

    const markAllRead = async () => {
        if (!token) return;
        await fetch(`${API_URL}/api/notifications/read-all`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPage(next * PAGE_SIZE);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-4xl mb-3">🔒</p>
                    <p className="text-ink-secondary font-bold">Please log in to see your notifications.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary py-10">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-ink-primary">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-ink-tertiary mt-0.5">{unreadCount} unread</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-sm font-black text-accent-400 hover:text-accent-500 px-4 py-2 rounded-xl hover:bg-accent-500/10 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="bg-surface-elevated rounded-3xl shadow-sm border border-border-primary overflow-hidden">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-5xl mb-4">🔔</p>
                            <p className="font-black text-ink-secondary text-lg">All caught up!</p>
                            <p className="text-ink-tertiary text-sm mt-1">No notifications yet. We'll let you know when something happens.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`flex items-start gap-4 px-6 py-4 transition-colors ${!notif.is_read ? 'bg-accent-500/10/30' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-surface-secondary flex items-center justify-center shrink-0 text-xl">
                                        {typeIcon[notif.type] || '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className={`text-sm leading-tight ${!notif.is_read ? 'font-black text-ink-primary' : 'font-semibold text-ink-secondary'}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.is_read && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-accent-500/100 shrink-0 mt-1" />
                                            )}
                                        </div>
                                        {notif.message && (
                                            <p className="text-sm text-ink-tertiary mt-1">{notif.message}</p>
                                        )}
                                        <p className="text-xs text-ink-tertiary mt-1.5">{formatDate(notif.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && !loading && notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-50">
                            <button
                                onClick={loadMore}
                                className="w-full py-3 text-sm font-black text-accent-400 hover:text-accent-500 hover:bg-accent-500/10 rounded-2xl transition-colors"
                            >
                                Load more
                            </button>
                        </div>
                    )}

                    {loading && notifications.length > 0 && (
                        <div className="p-4 flex justify-center border-t border-slate-50">
                            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

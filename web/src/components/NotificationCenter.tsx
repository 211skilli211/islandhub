'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';

interface Notification {
    id: number;
    type: string;
    title: string;
    message?: string;
    data?: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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

export default function NotificationCenter() {
    const { token, isAuthenticated } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<Notification | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/notifications?limit=30`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch {
            // graceful fail
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token || !isAuthenticated) return;
        fetchNotifications();

        const es = new EventSource(`${API_URL}/api/notifications/stream?token=${token}`);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
            try {
                const notif: Notification = JSON.parse(event.data);
                setNotifications(prev => [notif, ...prev]);
                setUnreadCount(c => c + 1);
                setToast(notif);
                setTimeout(() => setToast(null), 4000);
            } catch { /* ignore heartbeats */ }
        };

        return () => { es.close(); };
    }, [token, isAuthenticated, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [isOpen]);

    const markAllRead = async () => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/api/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { /* ignore */ }
    };

    const markOneRead = async (id: number) => {
        if (!token) return;
        try {
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch { /* ignore */ }
    };

    if (!isAuthenticated) return null;

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-4 z-9999 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[calc(100vw-32px)]">
                    <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl shadow-2xl px-4 py-3 min-w-[260px] max-w-[340px]">
                        <span className="text-2xl mt-0.5">{typeIcon[toast.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{toast.title}</p>
                            {toast.message && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.message}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="text-slate-300 hover:text-slate-500 shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Bell + Panel wrapper */}
            <div className="relative" ref={panelRef}>
                <button
                    id="notification-bell"
                    onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
                    className="relative text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
                    aria-label="Notifications"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/*
                  Dropdown panel.
                  Strategy: always use `fixed` so the panel is positioned relative
                  to the *viewport*, not the parent container. This prevents left-overflow
                  on mobile regardless of where in the navbar the bell sits.
                  - right-2: 8px from the viewport's right edge
                  - w-[calc(100vw-16px)]: fills viewport width minus 8px gutters on each side
                  - max-w-sm (384px): caps it on wide screens so it doesn't get silly wide
                  - top-[68px]: just below the navbar (adjust if navbar height changes)
                */}
                {isOpen && (
                    <div className="fixed left-1/2 -translate-x-1/2 top-[68px] w-[calc(100vw-32px)] max-w-sm sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-[52px] sm:w-80 sm:transform-none bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 z-1100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 text-sm">Notifications</h3>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <a
                                    href="/notifications"
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    View all
                                </a>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-10 text-center">
                                    <p className="text-3xl mb-2">🔔</p>
                                    <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notif) => (
                                    <button
                                        key={String(notif.id)}
                                        onClick={() => !notif.is_read && markOneRead(notif.id)}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!notif.is_read ? 'bg-teal-50/40' : ''}`}
                                    >
                                        <span className="text-xl shrink-0 mt-0.5">{typeIcon[notif.type] || '🔔'}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm leading-tight ${notif.is_read ? 'font-semibold text-slate-600' : 'font-black text-slate-900'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            {notif.message && (
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold">{timeAgo(notif.created_at)}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-100">
                                <a
                                    href="/notifications"
                                    className="block text-center text-xs font-black text-teal-600 hover:text-teal-700 py-2 hover:bg-teal-50 rounded-xl transition-colors"
                                >
                                    See all notifications →
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

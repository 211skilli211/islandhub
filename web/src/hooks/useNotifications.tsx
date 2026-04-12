'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';
import React from 'react';

interface NotificationEvent {
    type: string;
    jobId?: number;
    title?: string;
    status?: string;
    message?: string;
    price?: number;
    service_type?: string;
}

interface UseNotificationsOptions {
    mode?: 'driver' | 'customer';
    onNewJob?: (data: NotificationEvent) => void;
    onJobAccepted?: (data: NotificationEvent) => void;
    onStatusUpdate?: (data: NotificationEvent) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { user, token } = useAuthStore();
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!token || !user) return;

        // Build URL with mode parameter
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const url = `${baseUrl}/api/notifications/stream?mode=${options.mode || 'customer'}`;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        // Create EventSource with auth header workaround
        // Note: EventSource doesn't support custom headers natively
        // We'll use a polyfill approach or pass token as query param for SSE
        const eventSource = new EventSource(`${url}&token=${token}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('[SSE] Connected to notification stream');
        };

        eventSource.onerror = (error) => {
            console.error('[SSE] Connection error:', error);
            eventSource.close();

            // Attempt reconnect after 5 seconds
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('[SSE] Attempting to reconnect...');
                connect();
            }, 5000);
        };

        // Handle new job event (for drivers)
        eventSource.addEventListener('new_job', (event) => {
            const data: NotificationEvent = JSON.parse(event.data);
            console.log('[SSE] New job received:', data);

            // Show toast notification
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-center">
                            <div className="text-2xl mr-3">📦</div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-slate-800">New Job Available!</p>
                                <p className="mt-1 text-xs text-slate-500">{data.title} - ${data.price}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-teal-600 hover:text-teal-500 focus:outline-none"
                        >
                            View
                        </button>
                    </div>
                </div>
            ), { duration: 10000 });

options.onNewJob?.(data);
        });

// Handle job accepted event (for customers)
eventSource.addEventListener('job_accepted', (event) => {
    const data: NotificationEvent = JSON.parse(event.data);
    console.log('[SSE] Job accepted:', data);

    toast.success(data.message || 'A driver has accepted your request!', {
        icon: '✅',
        duration: 5000
    });

    options.onJobAccepted?.(data);
});

// Handle status update event (for customers)
eventSource.addEventListener('job_status_updated', (event) => {
    const data: NotificationEvent = JSON.parse(event.data);
    console.log('[SSE] Status updated:', data);

    const icons: Record<string, string> = {
        in_progress: '🚚',
        completed: '🏁',
        cancelled: '❌'
    };

    toast.success(data.message || `Status: ${data.status}`, {
        icon: icons[data.status || ''] || '📬',
        duration: 5000
    });

    options.onStatusUpdate?.(data);
});

return eventSource;
    }, [token, user, options]);

useEffect(() => {
    const eventSource = connect();

    return () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
    };
}, [connect]);

const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
    }
}, []);

return { disconnect };
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';

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
    onNewMessage?: (data: any) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { user, token } = useAuthStore();
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!token || !user) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const url = `${baseUrl}/api/notifications/stream?mode=${options.mode || 'customer'}&token=${token}`;

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('[SSE] Connected to notification stream');
        };

        eventSource.onerror = () => {
            eventSource.close();
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 5000);
        };

        // Handle new job event (for drivers)
        eventSource.addEventListener('new_job', (event) => {
            const data: NotificationEvent = JSON.parse(event.data);
            toast.success(`📦 New Job: ${data.title} - $${data.price}`, { duration: 8000 });
            options.onNewJob?.(data);
        });

        // Handle job accepted event (for customers)
        eventSource.addEventListener('job_accepted', (event) => {
            const data: NotificationEvent = JSON.parse(event.data);
            toast.success(data.message || 'A driver accepted your request!', { icon: '✅', duration: 5000 });
            options.onJobAccepted?.(data);
        });

        // Handle status update event (for customers)
        eventSource.addEventListener('job_status_updated', (event) => {
            const data: NotificationEvent = JSON.parse(event.data);
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

        // Handle job cancelled event
        eventSource.addEventListener('job_cancelled', (event) => {
            const data: NotificationEvent = JSON.parse(event.data);
            toast.error(data.message || 'Job has been cancelled', { icon: '❌', duration: 6000 });
            options.onStatusUpdate?.(data); // Reuse onStatusUpdate or add onCancelled if needed
        });

        // Handle new message event
        eventSource.addEventListener('new_message', (event) => {
            const data = JSON.parse(event.data);
            toast.success(`💬 ${data.content}`, { duration: 4000 });
            options.onNewMessage?.(data);
        });

        return eventSource;
    }, [token, user, options]);

    useEffect(() => {
        connect();

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

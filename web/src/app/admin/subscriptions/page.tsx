'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import SubscriptionsTab from '@/components/admin/SubscriptionsTab';

export default function AdminSubscriptionsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-ink-primary dark:text-white">Subscriptions</h2>
                <p className="text-ink-tertiary dark:text-ink-tertiary">Manage vendor subscriptions and plans</p>
            </div>
            <SubscriptionsTab />
        </div>
    );
}
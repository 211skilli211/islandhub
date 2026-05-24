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
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Subscriptions</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage vendor subscriptions and plans</p>
            </div>
            <SubscriptionsTab />
        </div>
    );
}
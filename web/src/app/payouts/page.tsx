'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import PayoutsTab from '@/components/admin/PayoutsTab';

export default function AdminPayoutsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payouts</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage vendor and driver payouts</p>
            </div>
            <PayoutsTab />
        </div>
    );
}
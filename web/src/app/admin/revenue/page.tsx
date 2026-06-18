'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import RevenueTab from '@/components/admin/RevenueTab';

export default function AdminRevenuePage() {
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
                <h2 className="text-2xl font-black text-ink-primary dark:text-white">Revenue Analytics</h2>
                <p className="text-ink-tertiary dark:text-ink-tertiary">Track platform revenue and earnings</p>
            </div>
            <RevenueTab />
        </div>
    );
}
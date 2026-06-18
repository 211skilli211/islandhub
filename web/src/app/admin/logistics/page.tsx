'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import LogisticsRatesTab from '@/components/admin/LogisticsRatesTab';

export default function AdminLogisticsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-ink-primary dark:text-white">Logistics Rates</h2>
                <p className="text-ink-tertiary dark:text-ink-tertiary">Configure delivery and dispatch rates</p>
            </div>
            <LogisticsRatesTab />
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import OverviewTab from '@/components/admin/OverviewTab';

interface Stats {
    totalUsers?: number;
    totalListings?: number;
    totalOrders?: number;
    totalRevenue?: number;
    activeVendors?: number;
    activeDrivers?: number;
    pendingKYC?: number;
    [key: string]: any;
}

export default function AdminOverviewPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                toast.error('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, user, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400 dark:text-slate-400">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                <p className="font-bold uppercase tracking-widest text-xs">Loading Analytics...</p>
            </div>
        );
    }

    const handleNavigate = (section: string) => {
        router.push(`/admin/${section}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Welcome back! Here's what's happening on your platform.</p>
            </div>
            <OverviewTab stats={stats} onNavigate={handleNavigate} />
        </div>
    );
}
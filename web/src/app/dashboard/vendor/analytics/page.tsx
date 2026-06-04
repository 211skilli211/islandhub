'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import VendorDashboardAnalytics from '@/components/VendorDashboardAnalytics';
import { motion } from 'framer-motion';

export default function VendorAnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/vendor');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface-primary dark:bg-ocean-900">
            <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-black text-ink-tertiary uppercase tracking-widest text-xs">Generating Reports...</p>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="min-h-screen flex items-center justify-center bg-surface-primary dark:bg-ocean-900">
            <div className="p-24 text-center font-bold text-ink-tertiary bg-surface-elevated dark:bg-ocean-800 rounded-[3rem] shadow-xl">
                Failed to load analytics. Please ensure your vendor profile is active.
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-surface-primary dark:bg-ocean-900 py-20 pb-40">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-ink-primary tracking-tight mb-4">
                        Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">Analytics</span>
                    </h1>
                    <p className="text-ink-tertiary font-medium text-lg italic max-w-2xl">
                        Deep insights into your business impact. Understand your audience, track conversions, and grow your island presence.
                    </p>
                </div>

                <VendorDashboardAnalytics data={stats} />
            </motion.div>
        </main>
    );
}

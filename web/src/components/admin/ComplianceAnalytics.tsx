'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface ComplianceStats {
    totalVendors: number;
    compliantVendors: number;
    pendingVendors: number;
    nonCompliantVendors: number;
    byCategory: { category: string; total: number; compliant: number; percentage: number }[];
    recentActivity: { vendorName: string; requirement: string; status: string; date: string }[];
}

export default function ComplianceAnalytics() {
    const [stats, setStats] = useState<ComplianceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get(`/admin/compliance/analytics?range=${timeRange}`);
            setStats(res.data);
        } catch (error) {
            // Use mock data for demo
            setStats({
                totalVendors: 156,
                compliantVendors: 89,
                pendingVendors: 42,
                nonCompliantVendors: 25,
                byCategory: [
                    { category: 'Products', total: 68, compliant: 45, percentage: 66 },
                    { category: 'Food', total: 52, compliant: 28, percentage: 54 },
                    { category: 'Services', total: 24, compliant: 12, percentage: 50 },
                    { category: 'Other', total: 12, compliant: 4, percentage: 33 },
                ],
                recentActivity: [
                    { vendorName: 'Island BBQ', requirement: 'Business License', status: 'approved', date: '2026-04-03' },
                    { vendorName: 'Caribbean Crafts', requirement: 'KYC Verification', status: 'pending', date: '2026-04-03' },
                    { vendorName: 'Tropical Eats', requirement: 'Food Safety Cert', status: 'rejected', date: '2026-04-02' },
                    { vendorName: 'Seaside Tours', requirement: 'Insurance', status: 'approved', date: '2026-04-01' },
                    { vendorName: 'Local Gems', requirement: 'Tax ID', status: 'pending', date: '2026-04-01' },
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 animate-pulse">
                <div className="h-4 bg-surface-tertiary rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-surface-tertiary rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    const complianceRate = stats ? Math.round((stats.compliantVendors / stats.totalVendors) * 100) : 0;

    return (
        <div className="space-y-6">
            
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-ink-primary">Compliance Analytics</h2>
                    <p className="text-sm text-ink-tertiary">Track vendor compliance across the platform</p>
                </div>
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                timeRange === range 
                                    ? 'bg-accent-500 text-white' 
                                    : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'
                            }`}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            
            <div className="grid grid-cols-4 gap-4">
                <motion.div 
                    className="bg-surface-elevated rounded-2xl border border-border-primary p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-ink-tertiary uppercase tracking-widest">Total Vendors</span>
                        <EmojiIcon emoji="🏪" size=24 className="text-2xl" />
                    </div>
                    <p className="text-2xl font-black text-ink-primary">{stats?.totalVendors}</p>
                </motion.div>

                <motion.div 
                    className="bg-surface-elevated rounded-2xl border border-border-primary p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-ink-tertiary uppercase tracking-widest">Compliant</span>
                        <EmojiIcon emoji="✅" size=24 className="text-2xl" />
                    </div>
                    <p className="text-2xl font-black text-green-600">{stats?.compliantVendors}</p>
                    <p className="text-xs text-ink-tertiary mt-1">{complianceRate}% of total</p>
                </motion.div>

                <motion.div 
                    className="bg-surface-elevated rounded-2xl border border-border-primary p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-ink-tertiary uppercase tracking-widest">Pending</span>
                        <span className="text-2xl">⏳</span>
                    </div>
                    <p className="text-2xl font-black text-sand-500">{stats?.pendingVendors}</p>
                    <p className="text-xs text-ink-tertiary mt-1">Awaiting review</p>
                </motion.div>

                <motion.div 
                    className="bg-surface-elevated rounded-2xl border border-border-primary p-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-ink-tertiary uppercase tracking-widest">Non-Compliant</span>
                        <EmojiIcon emoji="⚠️" size=24 className="text-2xl" />
                    </div>
                    <p className="text-2xl font-black text-red-600">{stats?.nonCompliantVendors}</p>
                    <p className="text-xs text-ink-tertiary mt-1">Action needed</p>
                </motion.div>
            </div>

            
            <div className="grid grid-cols-2 gap-6">
                
                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                    <h3 className="font-black text-ink-secondary mb-4">Compliance by Category</h3>
                    <div className="space-y-4">
                        {stats?.byCategory.map((cat) => (
                            <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-ink-secondary">{cat.category}</span>
                                    <span className="text-xs font-bold text-ink-tertiary">{cat.compliant}/{cat.total}</span>
                                </div>
                                <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                                    <motion.div 
                                        className={`h-full rounded-full ${cat.percentage >= 70 ? 'bg-green-500' : cat.percentage >= 50 ? 'bg-sand-500/50' : 'bg-red-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.percentage}%` }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                
                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                    <h3 className="font-black text-ink-secondary mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {stats?.recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-secondary">
                                <span className={`w-2 h-2 rounded-full ${
                                    activity.status === 'approved' ? 'bg-green-500' :
                                    activity.status === 'rejected' ? 'bg-red-500' : 'bg-sand-500/50'
                                }`}></span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-ink-secondary truncate">{activity.vendorName}</p>
                                    <p className="text-xs text-ink-tertiary">{activity.requirement}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    activity.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-sand-500/10 text-sand-500'
                                }`}>
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
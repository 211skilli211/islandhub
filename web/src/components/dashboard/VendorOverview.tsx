'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/api';
import VendorComplianceStatus from './VendorComplianceStatus';

interface VendorOverviewProps {
    subscription: any;
    stores: any[];
    activeStore: any;
    listingCount: number;
    requestCount: number;
    vendorId?: number;
}

export default function VendorOverview({ subscription, stores, activeStore, listingCount, requestCount, vendorId }: VendorOverviewProps) {
    // Check if user can have multiple stores based on subscription tier
    const canHaveMultipleStores = subscription?.tier_name === 'premium' || subscription?.tier_name === 'vip' || subscription?.tier_name === 'enterprise';
    const storeCount = stores.length;

    // Quick stats cards
    const quickStats = [
        {
            label: 'Active Listings',
            value: listingCount,
            icon: '📦',
            href: '/dashboard?tab=activity',
            color: 'bg-sand-500/5 border-sand-500/20'
        },
        {
            label: 'Service Requests',
            value: requestCount,
            icon: '🚖',
            href: '/dashboard?tab=activity',
            color: 'bg-[#14b8a6]/10 border-[#14b8a6]/20'
        },
        {
            label: 'Total Stores',
            value: storeCount,
            icon: '🏪',
            href: canHaveMultipleStores ? '/start' : '#',
            color: 'bg-accent-500/10 border-teal-100',
            locked: !canHaveMultipleStores && storeCount >= 1
        },
        {
            label: 'Subscription',
            value: subscription?.tier_name || 'Free',
            icon: '🎫',
            href: '#',
            color: 'bg-[#e11d48]/5 border-[#e11d48]/20'
        }
    ];

    // Quick action links
    const quickActions = [
        { label: 'Add Product', href: '/create?type=product', icon: '📦', color: 'bg-sand-500/50' },
        { label: 'Post Service', href: '/create?type=service', icon: '🛠️', color: 'bg-[#14b8a6]/100' },
        { label: 'Edit Branding', href: '/dashboard?tab=branding', icon: '🎨', color: 'bg-pink-500' },
        { label: 'View Analytics', href: '/dashboard/vendor/analytics', icon: '📊', color: 'bg-accent-500/100' },
        { label: 'Manage Orders', href: '/dashboard?tab=orders', icon: '🔥', color: 'bg-orange-500' },
        { label: 'Promotions', href: '/dashboard?tab=promotions', icon: '🎟️', color: 'bg-teal-500' },
    ];

    // Recent activity placeholder
    const recentActivity = [
        { type: 'order', message: 'New order received #1234', time: '5 min ago', icon: '🔥' },
        { type: 'listing', message: 'Product "Beach Towel" was viewed 12 times', time: '1 hour ago', icon: '👁️' },
        { type: 'review', message: 'You received a 5-star review!', time: '2 hours ago', icon: '⭐' },
    ];

    return (
        <div className="space-y-8">
            {/* Compliance Status */}
            {vendorId && (
                <VendorComplianceStatus vendorId={vendorId} compact />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary tracking-tight">Dashboard Overview</h2>
                    <p className="text-ink-tertiary0 font-medium">Welcome back! Here's what's happening with your stores.</p>
                </div>
                {activeStore?.slug && (
                    <Link
                        href={`/store/${activeStore.slug}`}
                        className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-accent-500/10"
                    >
                        <span>👁️</span> View Storefront
                    </Link>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {quickStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative p-4 sm:p-6 rounded-2xl sm:rounded-4xl border-2 transition-all ${stat.color} ${stat.locked ? 'opacity-75' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                    >
                        {stat.locked && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-ink-primary rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs shadow-lg">
                                🔒
                            </div>
                        )}
                        <Link href={stat.href} className="block text-center">
                            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{stat.icon}</div>
                            <div className="text-2xl sm:text-3xl font-black text-ink-primary">{stat.value}</div>
                            <div className="text-[8px] sm:text-[10px] font-black uppercase text-ink-tertiary0 tracking-widest mt-1">{stat.label}</div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Info Card */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-elevated rounded-2xl sm:rounded-4xl border border-border-primary shadow-sm p-4 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-surface-secondary overflow-hidden shrink-0 border-2 border-border-primary">
                                {activeStore?.logo_url ? (
                                    <img src={getImageUrl(activeStore.logo_url)} alt="Store Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">🏪</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-black text-ink-primary uppercase tracking-tight truncate">{activeStore?.name || 'Your Store'}</h3>
                                <p className="text-ink-tertiary0 font-medium text-xs sm:text-sm mt-1 line-clamp-2">{activeStore?.description || 'No description set yet'}</p>

                                {activeStore?.slug && (
                                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                                        <Link
                                            href={`/store/${activeStore.slug}`}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-accent-500/10 text-accent-400 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-accent-500/15 transition-all"
                                        >
                                            🌐 View Public Page
                                        </Link>
                                        <Link
                                            href="/dashboard?tab=branding"
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-surface-secondary text-ink-secondary rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-surface-secondary transition-all"
                                        >
                                            ✏️ Edit Details
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Multiple Stores Info */}
                        <div className="mt-4 sm:mt-8 pt-4 sm:pt-8 border-t border-border-primary">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <div>
                                    <h4 className="text-xs sm:text-sm font-black text-ink-secondary uppercase tracking-widest">Multi-Store Access</h4>
                                    <p className="text-[10px] sm:text-xs text-ink-tertiary font-medium mt-1">
                                        {canHaveMultipleStores
                                            ? `Your ${subscription.tier_name} plan allows unlimited stores`
                                            : 'Upgrade to Premium, VIP, or Enterprise for multiple stores'}
                                    </p>
                                </div>
                                {canHaveMultipleStores ? (
                                    <Link
                                        href="/start"
                                        className="px-4 py-2 sm:px-6 sm:py-3 bg-[#14b8a6] hover:bg-[#14b8a6] text-white rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all shadow-lg shadow-teal-100 text-center"
                                    >
                                        + Add Another Store
                                    </Link>
                                ) : (
                                    <div className="px-4 py-2 sm:px-6 sm:py-3 bg-surface-secondary text-ink-tertiary0 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest">
                                        🔒 Locked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-elevated rounded-2xl sm:rounded-4xl border border-border-primary shadow-sm p-4 sm:p-8">
                        <h3 className="text-xs sm:text-sm font-black text-ink-secondary uppercase tracking-widest mb-4 sm:mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-surface-secondary rounded-xl sm:rounded-2xl hover:scale-105 hover:shadow-md transition-all group"
                                >
                                    <div className={`w-9 h-9 sm:w-12 sm:h-12 ${action.color} rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-[8px] sm:text-[10px] font-black text-ink-secondary uppercase tracking-widest text-center leading-tight">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-elevated rounded-2xl sm:rounded-4xl border border-border-primary shadow-sm p-4 sm:p-8">
                <h3 className="text-xs sm:text-sm font-black text-ink-secondary uppercase tracking-widest mb-4 sm:mb-6">Recent Activity</h3>
                <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary rounded-xl sm:rounded-2xl">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-surface-elevated rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm shrink-0">
                                {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-ink-secondary truncate">{activity.message}</p>
                                <p className="text-[9px] sm:text-[10px] font-black text-ink-tertiary uppercase tracking-widest">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Link
                    href="/dashboard?tab=activity"
                    className="block mt-4 sm:mt-6 text-center text-[9px] sm:text-[10px] font-black text-accent-400 uppercase tracking-widest hover:text-accent-500 transition-all"
                >
                    View All Activity →
                </Link>
            </div>

            {/* Subscription Upgrade CTA */}
            {!canHaveMultipleStores && storeCount >= 1 && (
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl sm:rounded-4xl p-4 sm:p-8 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                        <div>
                            <h3 className="text-base sm:text-xl font-black uppercase tracking-tight">Unlock Multi-Store Functionality</h3>
                            <p className="text-white/70 font-medium mt-1 text-xs sm:text-base">Upgrade to Premium, VIP, or Enterprise to manage multiple stores from one dashboard.</p>
                        </div>
                        <button className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-[#14b8a6] rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-white/90 transition-all shadow-lg text-center">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

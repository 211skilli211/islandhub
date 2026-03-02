'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/api';

interface VendorOverviewProps {
    subscription: any;
    stores: any[];
    activeStore: any;
    listingCount: number;
    requestCount: number;
}

export default function VendorOverview({ subscription, stores, activeStore, listingCount, requestCount }: VendorOverviewProps) {
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
            color: 'bg-amber-50 border-amber-100'
        },
        {
            label: 'Service Requests',
            value: requestCount,
            icon: '🚖',
            href: '/dashboard?tab=activity',
            color: 'bg-indigo-50 border-indigo-100'
        },
        {
            label: 'Total Stores',
            value: storeCount,
            icon: '🏪',
            href: canHaveMultipleStores ? '/start' : '#',
            color: 'bg-teal-50 border-teal-100',
            locked: !canHaveMultipleStores && storeCount >= 1
        },
        {
            label: 'Subscription',
            value: subscription?.tier_name || 'Free',
            icon: '🎫',
            href: '#',
            color: 'bg-rose-50 border-rose-100'
        }
    ];

    // Quick action links
    const quickActions = [
        { label: 'Add Product', href: '/create?type=product', icon: '📦', color: 'bg-amber-500' },
        { label: 'Post Service', href: '/create?type=service', icon: '🛠️', color: 'bg-indigo-500' },
        { label: 'Edit Branding', href: '/dashboard?tab=branding', icon: '🎨', color: 'bg-pink-500' },
        { label: 'View Analytics', href: '/dashboard/vendor/analytics', icon: '📊', color: 'bg-teal-500' },
        { label: 'Manage Orders', href: '/dashboard?tab=orders', icon: '🔥', color: 'bg-orange-500' },
        { label: 'Promotions', href: '/dashboard?tab=promotions', icon: '🎟️', color: 'bg-purple-500' },
    ];

    // Recent activity placeholder
    const recentActivity = [
        { type: 'order', message: 'New order received #1234', time: '5 min ago', icon: '🔥' },
        { type: 'listing', message: 'Product "Beach Towel" was viewed 12 times', time: '1 hour ago', icon: '👁️' },
        { type: 'review', message: 'You received a 5-star review!', time: '2 hours ago', icon: '⭐' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-500 font-medium">Welcome back! Here's what's happening with your stores.</p>
                </div>
                {activeStore?.slug && (
                    <Link
                        href={`/store/${activeStore.slug}`}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-teal-100"
                    >
                        <span>👁️</span> View Storefront
                    </Link>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative p-6 rounded-4xl border-2 transition-all ${stat.color} ${stat.locked ? 'opacity-75' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                    >
                        {stat.locked && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                                🔒
                            </div>
                        )}
                        <Link href={stat.href} className="block text-center">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">{stat.label}</div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store Info Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-200">
                                {activeStore?.logo_url ? (
                                    <img src={getImageUrl(activeStore.logo_url)} alt="Store Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">🏪</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{activeStore?.name || 'Your Store'}</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">{activeStore?.description || 'No description set yet'}</p>

                                {activeStore?.slug && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            href={`/store/${activeStore.slug}`}
                                            className="px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-all"
                                        >
                                            🌐 View Public Page
                                        </Link>
                                        <Link
                                            href="/dashboard?tab=branding"
                                            className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                                        >
                                            ✏️ Edit Details
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Multiple Stores Info */}
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Multi-Store Access</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        {canHaveMultipleStores
                                            ? `Your ${subscription.tier_name} plan allows unlimited stores`
                                            : 'Upgrade to Premium, VIP, or Enterprise for multiple stores'}
                                    </p>
                                </div>
                                {canHaveMultipleStores ? (
                                    <Link
                                        href="/start"
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-100"
                                    >
                                        + Add Another Store
                                    </Link>
                                ) : (
                                    <div className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-xs tracking-widest">
                                        🔒 Locked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:scale-105 hover:shadow-md transition-all group"
                                >
                                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                {activity.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-700">{activity.message}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Link
                    href="/dashboard?tab=activity"
                    className="block mt-6 text-center text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-all"
                >
                    View All Activity →
                </Link>
            </div>

            {/* Subscription Upgrade CTA */}
            {!canHaveMultipleStores && storeCount >= 1 && (
                <div className="bg-linear-to-r from-indigo-600 to-teal-500 rounded-4xl p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Unlock Multi-Store Functionality</h3>
                            <p className="text-indigo-100 font-medium mt-1">Upgrade to Premium, VIP, or Enterprise to manage multiple stores from one dashboard.</p>
                        </div>
                        <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-lg">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import BannerModal, { BannerFormData } from './BannerModal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface OverviewTabProps {
    stats: any;
    onNavigate: (tab: any) => void;
}

export default function OverviewTab({ stats, onNavigate }: OverviewTabProps) {
    if (!stats) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 animate-pulse">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="font-bold uppercase tracking-widest text-xs">Loading Analytics...</p>
        </div>
    );

    const { users, stores, listings = [], transactions = [], activity = [] } = stats;

    // Prepare chart data
    const listingData = {
        labels: listings.length > 0 ? listings.map((l: any) => l.type.charAt(0).toUpperCase() + l.type.slice(1)) : ['No Data'],
        datasets: [
            {
                label: '# of Listings',
                data: listings.length > 0 ? listings.map((l: any) => parseInt(l.count)) : [0],
                backgroundColor: [
                    'rgba(13, 148, 136, 0.6)',
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                ],
                borderColor: [
                    '#0d9488',
                    '#6366f1',
                    '#f59e0b',
                    '#ef4444',
                ],
                borderWidth: 2,
                borderRadius: 4
            },
        ],
    };

    const transactionData = {
        labels: transactions.length > 0 ? transactions.map((t: any) => new Date(t.date).toLocaleDateString()) : ['No Data'],
        datasets: [
            {
                label: 'Donation Volume ($)',
                data: transactions.length > 0 ? transactions.map((t: any) => parseFloat(t.volume || 0)) : [0],
                borderColor: '#0d9488',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(13, 148, 136, 0.2)');
                    gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0d9488',
                pointBorderWidth: 2
            },
        ],
    };

    const [recentActivity, setRecentActivity] = useState<any[]>(stats.activity || []);
    const [isLogExpanded, setIsLogExpanded] = useState(false);
    const [newMarquee, setNewMarquee] = useState('');
    const [priority, setPriority] = useState(1);
    const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
    const [promoBanners, setPromoBanners] = useState<any[]>([]);
    const [isLaunching, setIsLaunching] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);

    useEffect(() => {
        fetchMissionData();
    }, []);

    const fetchMissionData = async () => {
        try {
            const [tempRes, bannerRes] = await Promise.all([
                api.get('/admin/marquee/templates'),
                api.get('/admin/promotions/banners')
            ]);
            setSavedTemplates(tempRes.data);
            setPromoBanners(bannerRes.data);
        } catch (error) {
            console.error('Failed to fetch mission data', error);
        }
    };

    const handleLaunchBroadcast = async () => {
        if (!newMarquee) return;
        setIsLaunching(true);
        try {
            await api.post('/marquee', { message: newMarquee, priority });
            toast.success('Broadcast launched! 🚀');
            setNewMarquee('');
        } catch (error: any) {
            console.error('Launch Broadcast Error:', error);
            toast.error(`Launch failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLaunching(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!newMarquee) return;
        const name = prompt('Template name:');
        if (!name) return;
        try {
            await api.post('/admin/marquee/templates', { name, content: newMarquee, priority });
            toast.success('Template saved! 💾');
            fetchMissionData();
        } catch (error) {
            toast.error('Save failed');
        }
    };

    const handleDeleteBanner = async (bannerId: number) => {
        if (!confirm('Permanently remove this banner?')) return;
        try {
            await api.delete(`/admin/promotions/banners/${bannerId}`);
            toast.success('Banner removed');
            fetchMissionData();
        } catch (e) {
            toast.error('Failed to remove banner');
        }
    };

    const handleClearMarquee = async () => {
        try {
            await api.delete('/marquee');
            setNewMarquee('');
            toast.success('Broadcast cleared');
        } catch (e) {
            toast.error('Failed to clear');
        }
    };

    const handleSaveBanner = async (bannerData: BannerFormData) => {
        try {
            if (editingBanner) {
                // Update existing banner
                await api.patch(`/admin/promotions/banners/${editingBanner.banner_id}`, bannerData);
                toast.success('Banner updated! ✨');
            } else {
                // Create new banner
                await api.post('/admin/promotions/banners', bannerData);
                toast.success('Banner created! 🎉');
            }
            fetchMissionData();
            setIsBannerModalOpen(false);
            setEditingBanner(null);
        } catch (error: any) {
            console.error('Banner save error:', error);
            throw error; // Let modal handle the error display
        }
    };

    const handleOpenBannerModal = (banner?: any) => {
        if (banner) {
            setEditingBanner(banner);
        } else {
            setEditingBanner(null);
        }
        setIsBannerModalOpen(true);
    };

    const handleEditBanner = async (banner: any) => {
        const title = prompt('Edit Title:', banner.title);
        if (title === null) return;
        const subtitle = prompt('Edit Subtitle:', banner.subtitle);
        const target_url = prompt('Edit Target URL:', banner.target_url);
        const image_url = prompt('Edit Image URL:', banner.image_url);
        const color_theme = prompt('Edit Color (teal, indigo, rose...):', banner.color_theme || 'teal');

        try {
            await api.patch(`/admin/promotions/banners/${banner.banner_id}`, { title, subtitle, target_url, image_url, color_theme });
            toast.success('Banner updated');
            fetchMissionData();
        } catch (e) {
            toast.error('Update failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Quick Access - Dispatch Button */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 rounded-3xl shadow-2xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black mb-1">Dispatch Command Center 🛰️</h3>
                        <p className="text-teal-100 font-medium">Real-time fleet management & driver tracking</p>
                    </div>
                    <a
                        href="/dispatch"
                        target="_blank"
                        className="px-8 py-4 bg-white text-teal-600 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        Open Dispatch →
                    </a>
                </div>
            </div>

            {/* Creation Hub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-teal-500 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏪</div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Onboard Vendor</h4>
                            <p className="text-[9px] text-slate-400 font-medium tracking-tight">Create a new store</p>
                        </div>
                    </div>
                    <Link href="/become-vendor" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-teal-600 transition-all">Start</Link>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-indigo-500 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Add Listing</h4>
                            <p className="text-[9px] text-slate-400 font-medium tracking-tight">Post item or service</p>
                        </div>
                    </div>
                    <Link href="/create" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-600 transition-all">Add</Link>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-rose-500 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📣</div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">New Campaign</h4>
                            <p className="text-[9px] text-slate-400 font-medium tracking-tight">Launch fundraiser</p>
                        </div>
                    </div>
                    <Link href="/campaigns/new" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-600 transition-all">Launch</Link>
                </div>
            </div>

            {/* Stat Cards (Reduced size row) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Users Card */}
                <button
                    onClick={() => onNavigate('users')}
                    className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 group hover:border-teal-500 hover:-translate-y-1 transition-all text-left w-full"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-teal-500 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Directory</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mb-0.5">{users.total.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Users</div>
                    <div className="mt-3 flex gap-3 border-t border-slate-50 pt-3">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active</p>
                            <p className="font-bold text-green-600 text-xs">{users.active}</p>
                        </div>
                        <div className="text-right flex-1">
                            <span className="text-[10px] font-black text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Manage ➔</span>
                        </div>
                    </div>
                </button>

                {/* Stores Card (Vendors) */}
                <button
                    onClick={() => onNavigate('stores')}
                    className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 group hover:border-teal-500 hover:-translate-y-1 transition-all text-left w-full"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-[8px] font-black bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Marketplace</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mb-0.5">{stores.total.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active Stores</div>
                    <div className="mt-3 flex gap-3 border-t border-slate-50 pt-3">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live</p>
                            <p className="font-bold text-teal-600 text-xs">{stores.active}</p>
                        </div>
                        <div className="text-right flex-1">
                            <span className="text-[10px] font-black text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">View All ➔</span>
                        </div>
                    </div>
                </button>

                {/* Campaigns Card */}
                <button
                    onClick={() => onNavigate('campaigns')}
                    className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 group hover:border-teal-500 hover:-translate-y-1 transition-all text-left w-full"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-teal-500 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Fundraising</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mb-0.5">
                        {(stats.campaigns_count ?? listings.filter((l: any) => l.type === 'campaign').reduce((acc: number, curr: any) => acc + parseInt(curr.count), 0)) || '-'}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Campaign Hub</div>
                    <div className="mt-3 flex gap-3 border-t border-slate-50 pt-3">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Growth</p>
                            <p className="font-bold text-amber-600 text-xs">+12%</p>
                        </div>
                        <div className="text-right flex-1">
                            <span className="text-[10px] font-black text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Inspect ➔</span>
                        </div>
                    </div>
                </button>

                {/* Revenue Card */}
                <button
                    onClick={() => onNavigate('revenue')}
                    className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 group hover:border-teal-500 hover:-translate-y-1 transition-all text-left w-full"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-xl bg-green-50 text-green-600 group-hover:bg-teal-500 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Financials</span>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-teal-600 mb-0.5">
                        ${(stats.total_revenue || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Platform Revenue</div>
                    <div className="mt-3 border-t border-slate-50 pt-3 flex justify-between items-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Sales</p>
                        <span className="text-[10px] font-black text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Deep Dive ➔</span>
                    </div>
                </button>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Transaction Velocity</h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">30 Day Volume</span>
                        </div>
                    </div>
                    <div className="h-72">
                        <Line
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.03)' },
                                        ticks: { font: { weight: 'bold', size: 10 } }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { font: { weight: 'bold', size: 10 } }
                                    }
                                },
                                plugins: { legend: { display: false } }
                            }}
                            data={transactionData}
                        />
                    </div>
                </div>

                {/* Listings Breakdown */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 text-center">Marketplace Inventory</h3>
                    <div className="h-72 flex flex-col items-center justify-center">
                        {listings.length > 0 ? (
                            <div className="w-full h-full max-w-[300px]">
                                <Doughnut
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    usePointStyle: true,
                                                    padding: 20,
                                                    font: { size: 10, weight: 'bold' }
                                                }
                                            }
                                        },
                                        cutout: '70%'
                                    }}
                                    data={listingData}
                                />
                            </div>
                        ) : (
                            <div className="text-slate-300 font-bold uppercase tracking-widest italic text-center">No Data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity Section (Mission Control Integration) */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">System Activity Log</h3>
                        <p className="text-sm font-medium text-slate-400 italic">Live administrative pulse</p>
                    </div>
                    <button
                        onClick={() => setIsLogExpanded(!isLogExpanded)}
                        className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        {isLogExpanded ? 'Collapse ▴' : `Expand (${activity.length}) ▾`}
                    </button>
                </div>

                <div className={`space-y-3 transition-all duration-500 overflow-hidden ${isLogExpanded ? 'max-h-[1000px]' : 'max-h-[340px]'}`}>
                    {activity.length > 0 ? (isLogExpanded ? activity : activity.slice(0, 5)).map((act: any) => (
                        <div key={act.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50/50 transition-all border border-slate-50 group">
                            <div className={`w-2 h-2 rounded-full ${act.action.includes('create') ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                act.action.includes('delete') ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                                }`}></div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                                    {act.action.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">By {act.admin_name} • Ref #{act.record_id}</p>
                            </div>
                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-slate-50 shadow-sm">
                                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 text-slate-300 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                            <div className="text-4xl mb-2">🔭</div>
                            <p className="font-bold uppercase tracking-widest text-[10px]">No activity logs found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Broadcast & Asset Command Center (New Section below activity) */}
            <div className="mt-12 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            </div>

                            <h3 className="text-2xl font-black mb-1">Global Broadcast Hub 📣</h3>
                            <p className="text-indigo-100 text-sm font-medium mb-8">Deploy live announcements to the platform-wide marquee</p>

                            <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20">
                                <textarea
                                    placeholder="Deploy a message to everyone..."
                                    value={newMarquee}
                                    onChange={(e) => setNewMarquee(e.target.value)}
                                    className="w-full bg-transparent border-none text-white placeholder:text-white/40 focus:ring-0 text-lg font-black resize-none h-24"
                                ></textarea>
                                <div className="flex flex-col xl:flex-row gap-4 justify-between items-center mt-4">
                                    <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-center xl:justify-start">
                                        <button
                                            onClick={handleLaunchBroadcast}
                                            disabled={isLaunching || !newMarquee}
                                            className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50 flex-1 sm:flex-none whitespace-nowrap"
                                        >
                                            {isLaunching ? 'Launching...' : 'Launch Now 🚀'}
                                        </button>
                                        <button
                                            onClick={handleSaveTemplate}
                                            disabled={!newMarquee}
                                            className="px-5 py-2.5 bg-indigo-500/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all border border-white/20 disabled:opacity-50 flex-1 sm:flex-none whitespace-nowrap"
                                        >
                                            Save Template
                                        </button>
                                        <button
                                            onClick={handleClearMarquee}
                                            className="px-5 py-2.5 bg-red-500/20 text-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/40 transition-all border border-red-500/20 flex-1 sm:flex-none whitespace-nowrap"
                                        >
                                            Clear Active
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 w-full xl:w-auto">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200 whitespace-nowrap">Priority</span>
                                        <input
                                            type="range" min="1" max="10" value={priority}
                                            onChange={(e) => setPriority(parseInt(e.target.value))}
                                            className="w-16 sm:w-24 accent-white"
                                        />
                                        <span className="text-xs font-black w-4 text-center">{priority}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Promotional Assets Strip */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Marketplace Banners</h3>
                                <button
                                    onClick={() => handleOpenBannerModal()}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100"
                                >
                                    + New Asset
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div
                                    onClick={() => handleOpenBannerModal()}
                                    className="aspect-[16/9] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-teal-400 transition-all"
                                >
                                    <span className="text-2xl group-hover:scale-125 transition-transform">🖼️</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upload Promo</span>
                                </div>
                                {(!promoBanners || promoBanners.length === 0) && (
                                    <div className="col-span-full text-slate-400 text-[10px] font-medium text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        No assets found. Start by uploading one!
                                    </div>
                                )}
                                {(promoBanners || []).map(banner => (
                                    <div
                                        key={banner.banner_id}
                                        onClick={async (e) => {
                                            const newState = !banner.is_active;
                                            try {
                                                await api.patch(`/admin/promotions/banners/${banner.banner_id}/toggle`, { is_active: newState });
                                                toast.success(newState ? 'Banner activated! 🌟' : 'Banner deactivated');
                                                fetchMissionData();
                                            } catch (e: any) {
                                                console.error('Toggle Banner Error:', e);
                                                toast.error(`Toggle failed: ${e.response?.data?.message || e.message}`);
                                            }
                                        }}
                                        className={`aspect-[16/9] bg-slate-900 rounded-2xl relative overflow-hidden group border-2 transition-all cursor-pointer ${banner.is_active ? 'border-teal-500 shadow-xl shadow-teal-500/20' : 'border-transparent hover:border-slate-300'}`}
                                    >
                                        {banner.image_url && <img src={banner.image_url} className={`w-full h-full object-cover transition-transform duration-700 ${banner.is_active ? 'opacity-80' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60'}`} />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={`text-[8px] font-black uppercase tracking-widest ${banner.is_active ? 'text-teal-400' : 'text-slate-500'}`}>
                                                            {banner.location?.replace('_hero', '') || 'General'}
                                                        </p>
                                                        {banner.target_url && <span className="text-[8px] text-slate-600 font-mono bg-slate-800 px-1 rounded">→ {banner.target_url}</span>}
                                                    </div>
                                                    <h4 className={`text-sm font-bold leading-tight ${banner.is_active ? 'text-white' : 'text-slate-400'}`}>
                                                        {banner.title}
                                                    </h4>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full ${banner.is_active ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse' : 'bg-slate-700'}`}></div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditBanner(banner);
                                                }}
                                                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await handleDeleteBanner(banner.banner_id);
                                                }}
                                                className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg backdrop-blur-sm transition-colors"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mission Templates / Control Panel */}
                    <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-400/10 blur-3xl rounded-full"></div>
                        <h3 className="text-lg font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Saved Missions</h3>

                        <div className="space-y-4">
                            {savedTemplates.length > 0 ? savedTemplates.slice(0, 5).map(mission => (
                                <button
                                    key={mission.template_id}
                                    onClick={() => {
                                        setNewMarquee(mission.content);
                                        setPriority(mission.priority);
                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform">⚡</span>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-xs font-black uppercase tracking-widest text-indigo-300 truncate">{mission.name}</div>
                                        <div className="text-[9px] font-medium text-slate-500 uppercase tracking-tight truncate">Level {mission.priority} Priority</div>
                                    </div>
                                    <svg className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            )) : (
                                <div className="text-center py-8 text-white/20 border border-white/5 rounded-3xl border-dashed">
                                    <p className="text-[10px] font-black uppercase tracking-widest font-mono">No scripts ready</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10">
                            <button
                                onClick={() => onNavigate('broadcasts')}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all text-center"
                            >
                                Advanced Broadcast Lab ➔
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Banner Modal */}
            <BannerModal
                isOpen={isBannerModalOpen}
                onClose={() => {
                    setIsBannerModalOpen(false);
                    setEditingBanner(null);
                }}
                onSave={handleSaveBanner}
                initialData={editingBanner}
                mode={editingBanner ? 'edit' : 'create'}
            />
        </div >
    );
}

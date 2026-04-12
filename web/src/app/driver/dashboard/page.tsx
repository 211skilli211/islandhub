'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DriverDashboard() {
    const { user, setUser } = useAuthStore();
    const [jobs, setJobs] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [completedJobs, setCompletedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'earnings' | 'vehicles' | 'profile'>('available');
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0 });

    useEffect(() => {
        if (user) {
            syncProfile();
            fetchJobs();
            // Auto-refresh every 15 seconds
            const interval = setInterval(fetchJobs, 15000);
            return () => clearInterval(interval);
        }
    }, [user?.id]); // Use user?.id to avoid infinite loops if user object changes but ID doesn't

    const syncProfile = async () => {
        try {
            const res = await api.get(`/users/${user?.id}`);
            if (res.data) {
                setUser({ ...user, ...res.data, id: res.data.user_id }); // Sync store
            }
        } catch (error) {
            console.error('Failed to sync profile:', error);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            // Fetch available jobs
            const availRes = await api.get('/logistics/jobs');
            setJobs(availRes.data?.jobs || []);

            // Fetch my active jobs
            if (user?.id) {
                const activeRes = await api.get(`/listings?driver_id=${user.id}`);
                const listings = activeRes.data?.listings || [];
                const myActiveJobs = listings.filter((l: any) =>
                    ['pickup', 'delivery', 'taxi'].includes(l.service_type) &&
                    ['accepted', 'in_progress'].includes(l.transport_status)
                );
                const myCompletedJobs = listings.filter((l: any) =>
                    ['pickup', 'delivery', 'taxi'].includes(l.service_type) &&
                    l.transport_status === 'completed'
                );
                setActiveJobs(myActiveJobs);
                setCompletedJobs(myCompletedJobs);

                // Calculate earnings
                const today = new Date().toDateString();
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

                const todayEarnings = myCompletedJobs
                    .filter((j: any) => new Date(j.updated_at).toDateString() === today)
                    .reduce((sum: number, j: any) => sum + parseFloat(j.price || 0), 0);

                const weekEarnings = myCompletedJobs
                    .filter((j: any) => new Date(j.updated_at) >= weekAgo)
                    .reduce((sum: number, j: any) => sum + parseFloat(j.price || 0), 0);

                const monthEarnings = myCompletedJobs
                    .filter((j: any) => new Date(j.updated_at) >= monthAgo)
                    .reduce((sum: number, j: any) => sum + parseFloat(j.price || 0), 0);

                const totalEarnings = myCompletedJobs
                    .reduce((sum: number, j: any) => sum + parseFloat(j.price || 0), 0);

                setEarnings({
                    today: todayEarnings,
                    week: weekEarnings,
                    month: monthEarnings,
                    total: totalEarnings
                });
            }
        } catch (error) {
            console.error(error);
            setJobs([]);
            setActiveJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptJob = async (jobId: number) => {
        try {
            await api.post(`/logistics/jobs/${jobId}/accept`);
            toast.success('Job Accepted! 🏁');
            fetchJobs();
            setActiveTab('active');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept job');
        }
    };

    const handleUpdateStatus = async (jobId: number, status: string) => {
        try {
            await api.patch(`/logistics/jobs/${jobId}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchJobs();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading && jobs.length === 0 && activeJobs.length === 0) {
        return <div className="p-20 text-center">Loading Hub...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 pt-24 pb-8 rounded-b-[3rem] shadow-2xl">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Driver Portal</p>
                            <h1 className="text-3xl md:text-4xl font-black">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
                            <p className="text-slate-400 font-medium mt-1">
                                {user?.vehicle_type && `${user.vehicle_type.charAt(0).toUpperCase() + user.vehicle_type.slice(1)} Driver`}
                                {user?.is_verified_driver && <span className="ml-2 text-green-400">✓ Verified</span>}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/20 shadow-lg">
                            👨‍✈️
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Today</p>
                            <p className="text-2xl font-black text-green-400">${earnings.today.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">This Week</p>
                            <p className="text-2xl font-black text-teal-400">${earnings.week.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active</p>
                            <p className="text-2xl font-black text-blue-400">{activeJobs.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Completed</p>
                            <p className="text-2xl font-black text-purple-400">{completedJobs.length}</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mt-6 flex gap-2 p-1 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10">
                        {[
                            { id: 'available', label: 'Available', count: jobs.length, icon: '🎯' },
                            { id: 'active', label: 'Active', count: activeJobs.length, icon: '🚗' },
                            { id: 'earnings', label: 'Earnings', icon: '💰' },
                            { id: 'vehicles', label: 'Vehicles', icon: '🚐' },
                            { id: 'profile', label: 'Profile', icon: '👤' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                {tab.label}
                                {tab.count !== undefined && ` (${tab.count})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-6 space-y-4">
                {/* Available Jobs Tab */}
                {activeTab === 'available' && (
                    <div className="space-y-4">
                        {jobs.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-6xl mb-4">😴</p>
                                <p className="font-bold text-slate-600">No jobs available for your vehicle.</p>
                                <p className="text-sm text-slate-400 mt-2">Check back soon or adjust your availability.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl pointer-events-none grayscale group-hover:grayscale-0 transition-all">
                                        {job.service_type === 'taxi' ? '🚖' : job.service_type === 'delivery' ? '📦' : '🚚'}
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {job.service_type}
                                            </span>
                                            <span className="text-2xl font-black text-teal-600">${job.price}</span>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-2">{job.title}</h3>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{job.description}</p>

                                        <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pickup</p>
                                                    <p className="text-sm font-bold text-slate-800">{job.pickup_location}</p>
                                                </div>
                                            </div>
                                            <div className="w-0.5 h-4 bg-slate-200 ml-1.5" />
                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Dropoff</p>
                                                    <p className="text-sm font-bold text-slate-800">{job.dropoff_location}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAcceptJob(job.id)}
                                            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95">
                                            Accept Request 🚀
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Active Jobs Tab */}
                {activeTab === 'active' && (
                    <div className="space-y-4">
                        {activeJobs.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-6xl mb-4">🎯</p>
                                <p className="font-bold text-slate-600">No active jobs. Go get 'em!</p>
                            </div>
                        ) : (
                            activeJobs.map(job => (
                                <div key={job.id} className="bg-gradient-to-br from-white to-teal-50 p-6 rounded-3xl border-2 border-teal-200 shadow-xl relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="px-3 py-1 bg-teal-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                                                {job.transport_status.replace('_', ' ')}
                                            </span>
                                            <h3 className="text-xl font-black text-slate-900">{job.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{job.pickup_location} → {job.dropoff_location}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                                            {job.service_type === 'taxi' ? '🚖' : '📦'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button
                                            onClick={() => handleUpdateStatus(job.id, 'in_progress')}
                                            disabled={job.transport_status === 'in_progress'}
                                            className={`py-3 rounded-xl font-black uppercase text-xs tracking-widest border-2 transition-all ${job.transport_status === 'in_progress'
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                                                }`}>
                                            🚗 Start / En Route
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(job.id, 'completed')}
                                            className="py-3 bg-green-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-green-600 transition-all border-2 border-green-500">
                                            ✓ Complete Job
                                        </button>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center border border-teal-200">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Navigation</p>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.dropoff_location)}`}
                                            target="_blank"
                                            className="text-sm font-bold text-blue-600 hover:underline">
                                            Open Google Maps 🗺️
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Earnings Tab */}
                {activeTab === 'earnings' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-3xl text-white shadow-2xl">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Today's Earnings</p>
                                <p className="text-5xl font-black mb-4">${earnings.today.toFixed(2)}</p>
                                <p className="text-sm opacity-80">Keep up the great work! 🚀</p>
                            </div>
                            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl text-white shadow-2xl">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">This Week</p>
                                <p className="text-5xl font-black mb-4">${earnings.week.toFixed(2)}</p>
                                <p className="text-sm opacity-80">{completedJobs.length} jobs completed</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Earnings Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="font-bold text-slate-700">This Month</span>
                                    <span className="text-2xl font-black text-teal-600">${earnings.month.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="font-bold text-slate-700">Total Lifetime</span>
                                    <span className="text-2xl font-black text-indigo-600">${earnings.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="font-bold text-slate-700">Average per Job</span>
                                    <span className="text-2xl font-black text-purple-600">
                                        ${completedJobs.length > 0 ? (earnings.total / completedJobs.length).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vehicles Tab */}
                {activeTab === 'vehicles' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Manage My Fleet & Services</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Vehicle Selection */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Vehicle</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'scooter', label: 'Scooter', icon: '🛵' },
                                            { id: 'car', label: 'Car', icon: '🚗' },
                                            { id: 'suv', label: 'SUV', icon: '🚙' },
                                            { id: 'truck', label: 'Truck', icon: '🚚' }
                                        ].map(v => (
                                            <button
                                                key={v.id}
                                                onClick={async () => {
                                                    try {
                                                        await api.put(`/users/update`, { vehicle_type: v.id });
                                                        toast.success(`Vehicle updated to ${v.label}`);
                                                        window.location.reload();
                                                    } catch (e) {
                                                        toast.error('Failed to update vehicle');
                                                    }
                                                }}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${user?.vehicle_type === v.id
                                                    ? 'border-teal-500 bg-teal-50 shadow-md'
                                                    : 'border-slate-100 bg-slate-50 hover:border-teal-200'
                                                    }`}>
                                                <span className="text-3xl">{v.icon}</span>
                                                <span className="text-xs font-black uppercase tracking-widest">{v.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Services Offered */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Services Offered</h4>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'taxi', label: 'Taxi / Rideshare', icon: '🚖' },
                                            { id: 'delivery', label: 'Parcel Delivery', icon: '📦' },
                                            { id: 'pickup', label: 'Heavy Pickup', icon: '🚚' }
                                        ].map(s => (
                                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{s.icon}</span>
                                                    <span className="font-bold text-slate-700">{s.label}</span>
                                                </div>
                                                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                    <input type="checkbox" name="toggle" id={s.id} readOnly checked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-teal-500 checked:right-0 right-4 transition-all duration-200" />
                                                    <label htmlFor={s.id} className="toggle-label block overflow-hidden h-6 rounded-full bg-teal-500 cursor-pointer"></label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">
                                        * You will only receive jobs matching your active vehicle and selected services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Stats Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-2xl overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-2">Fleet Performance</h3>
                                <p className="text-indigo-100 mb-6">Your current vehicle efficiency and stats</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl">
                                        <p className="text-[10px] font-black uppercase opacity-60">Reliability</p>
                                        <p className="text-xl font-black">98.5%</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl">
                                        <p className="text-[10px] font-black uppercase opacity-60">Avg Rating</p>
                                        <p className="text-xl font-black">4.92 ⭐</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl">
                                        <p className="text-[10px] font-black uppercase opacity-60">Response</p>
                                        <p className="text-xl font-black">2.4m</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl">
                                        <p className="text-[10px] font-black uppercase opacity-60">Tier</p>
                                        <p className="text-xl font-black">Silver</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🚐</div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center text-5xl border-4 border-white shadow-lg">
                                    👨‍✈️
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">{user?.name}</h2>
                                    <p className="text-slate-500 font-medium">{user?.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        {user?.is_verified_driver && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black">
                                                ✓ Verified Driver
                                            </span>
                                        )}
                                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-black uppercase">
                                            {user?.vehicle_type || 'No Vehicle'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-2xl">
                                    <h3 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-xs">Driver Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium">Total Jobs</span>
                                            <span className="font-black text-slate-900">{completedJobs.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium">Active Jobs</span>
                                            <span className="font-black text-blue-600">{activeJobs.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium">Total Earned</span>
                                            <span className="font-black text-green-600">${earnings.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-2xl">
                                    <h3 className="font-black text-slate-800 mb-4 uppercase tracking-widest text-xs">Vehicle Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium">Type</span>
                                            <span className="font-black text-slate-900 capitalize">{user?.vehicle_type || 'Not Set'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium">Status</span>
                                            <span className={`font-black ${user?.is_verified_driver ? 'text-green-600' : 'text-amber-600'}`}>
                                                {user?.is_verified_driver ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <Link
                                    href={`/users/${user?.id}`}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-center"
                                >
                                    View Public Profile 👤
                                </Link>
                                <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                                    <p className="text-sm text-blue-800 font-medium">
                                        💡 <strong>Tip:</strong> Keep your profile updated and maintain a high completion rate to receive more job requests!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import DeliveryChat from '@/components/DeliveryChat';
import WalletTab from './WalletTab';
import { useAuthStore } from '@/lib/auth';
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
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function DriverPortal() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [completedJobs, setCompletedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'available' | 'active' | 'earnings' | 'services' | 'intel'>('available');
    const [isOnline, setIsOnline] = useState(false);
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, total: 0, chartData: [] as any[] });
    const [driverSummary, setDriverSummary] = useState({ totalJobs: 0, avgRating: 5.0 });
    const [myServices, setMyServices] = useState<any[]>([]);
    const [chatJob, setChatJob] = useState<any>(null);
    const trackingInterval = useRef<NodeJS.Timeout | null>(null);
    const { user, refreshUser } = useAuthStore() as any;

    useEffect(() => {
        refreshUser().then(() => {
            if (user?.is_online) setIsOnline(true);
        });
    }, []);

    const fetchJobs = useCallback(async () => {
        try {
            const [availRes, myJobsRes, statsRes] = await Promise.all([
                api.get('/logistics/jobs'),
                api.get('/listings?driver_id=me'),
                api.get('/logistics/stats')
            ]);

            setJobs(availRes.data?.jobs || []);

            const allMyJobs = myJobsRes.data || [];
            setActiveJobs(allMyJobs.filter((j: any) => ['accepted', 'in_progress'].includes(j.transport_status)));
            setCompletedJobs(allMyJobs.filter((j: any) => j.transport_status === 'completed'));

            if (statsRes.data?.success) {
                const summary = statsRes.data.summary;
                setEarnings({
                    today: parseFloat(summary.today || 0),
                    week: parseFloat(summary.week || 0),
                    month: parseFloat(summary.month || 0),
                    total: parseFloat(summary.lifetime || 0),
                    chartData: statsRes.data.daily
                });
                setDriverSummary({
                    totalJobs: summary.total_jobs,
                    avgRating: parseFloat(summary.avg_rating || 5.0),
                    //@ts-ignore
                    successRate: summary.success_rate,
                    //@ts-ignore
                    totalMissions: summary.total_missions
                });
            }

            // Fetch marketplace services
            const servicesRes = await api.get('/listings?creator_id=me');
            const allServices = Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data.listings || []);
            setMyServices(allServices.filter((s: any) => !['taxi', 'delivery', 'pickup'].includes(s.service_type)));
        } catch (error) {
            console.error('Failed to fetch driver data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Live Tracking Logic
    useEffect(() => {
        if (isOnline && activeJobs.length > 0) {
            trackingInterval.current = setInterval(() => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            await api.post('/logistics/location', {
                                lat: latitude,
                                lng: longitude,
                                jobId: activeJobs[0].id // Track the first active job
                            });
                        } catch (err) {
                            console.error('Location sync failed');
                        }
                    });
                }
            }, 10000); // Sync every 10s
        } else {
            if (trackingInterval.current) clearInterval(trackingInterval.current);
        }
        return () => { if (trackingInterval.current) clearInterval(trackingInterval.current); };
    }, [isOnline, activeJobs]);

    useNotifications({
        mode: 'driver',
        onNewJob: () => fetchJobs(),
        onStatusUpdate: () => fetchJobs(),
        onNewMessage: (data) => {
            // If the message belong to an active job, maybe highlight it?
            // For now, fetchJobs will refresh data if needed
            fetchJobs();
        }
    });

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 30000);
        return () => clearInterval(interval);
    }, [fetchJobs]);

    const toggleOnline = async () => {
        try {
            const nextStatus = !isOnline;
            await api.post('/logistics/status', { isOnline: nextStatus });
            setIsOnline(nextStatus);
            toast.success(nextStatus ? "You are now ONLINE 🟢" : "You are now OFFLINE 🔴");
        } catch (error) {
            toast.error("Failed to toggle status");
        }
    };

    const handleAcceptJob = async (jobId: number) => {
        if (!isOnline) return toast.error("Go online to accept jobs!");
        try {
            await api.post(`/logistics/jobs/${jobId}/accept`);
            toast.success('Job Accepted! 🏁');
            fetchJobs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept job');
        }
    };

    const handleUpdateStatus = async (jobId: number, status: string) => {
        try {
            await api.patch(`/logistics/jobs/${jobId}/status`, { status });
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            fetchJobs();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openNavigation = (location: any) => {
        try {
            const loc = typeof location === 'string' ? JSON.parse(location) : location;
            if (loc?.lat && loc?.lng) {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
            } else {
                toast.error("Invalid location coordinates");
            }
        } catch (e) {
            toast.error("Could not open navigation");
        }
    };

    const chartData = {
        labels: earnings.chartData.map(d => new Date(d.date).toLocaleDateString([], { weekday: 'short' })),
        datasets: [{
            label: 'Daily Earnings ($)',
            data: earnings.chartData.map(d => parseFloat(d.earnings)),
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const parseLocation = (loc: any): string => {
        try {
            if (!loc) return 'Unknown Location';
            let data = typeof loc === 'string' ? JSON.parse(loc) : loc;
            if (typeof data === 'object' && data !== null) {
                if (typeof data.address === 'object') return data.address.address || data.address.name || 'Unknown';
                return data.address || data.name || data.display_name || 'Unknown';
            }
            return String(data);
        } catch (error) { return 'Invalid Format'; }
    };

    return (
        <div className="space-y-8">
            {/* Online Toggle & Quick Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-4xl border border-slate-100 shadow-sm gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleOnline}
                        className={`relative w-20 h-10 rounded-full transition-all duration-300 p-1 ${isOnline ? 'bg-teal-600' : 'bg-slate-200'}`}
                    >
                        <div className={`w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${isOnline ? 'translate-x-10' : 'translate-x-0'}`}>
                            {isOnline ? '🟢' : '🔴'}
                        </div>
                    </button>
                    <div>
                        <h4 className="font-black text-slate-800 uppercase italic tracking-tighter">
                            {isOnline ? 'Active & Ready' : 'Taking a Break'}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isOnline ? 'Visible to dispatch' : 'Go online to see jobs'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                        <p className="text-xl font-black text-amber-500">⭐ {driverSummary.avgRating.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime</p>
                        <p className="text-xl font-black text-teal-600">${earnings.total.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {([
                        { id: 'available', label: 'Feed' },
                        { id: 'active', label: 'On Job' },
                        { id: 'earnings', label: 'Earning' },
                        { id: 'intel', label: 'Intel' },
                        { id: 'services', label: 'My Hub' }
                    ] as const).map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === view.id ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {activeView === 'available' && (
                        <div className="space-y-4">
                            {!isOnline && (
                                <div className="p-8 text-center bg-teal-50 border border-teal-100 rounded-4xl">
                                    <p className="text-teal-700 font-black uppercase text-xs tracking-widest">You are currently offline</p>
                                    <p className="text-teal-600 text-[10px] mt-1">Switch the toggle above to start receiving job requests.</p>
                                </div>
                            )}
                            {jobs.length > 0 ? jobs.map(job => (
                                <div key={job.id} className="p-6 bg-white border border-slate-100 rounded-4xl flex flex-col md:flex-row justify-between items-center hover:shadow-xl transition-all group gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                            {job.service_type === 'taxi' ? '🚖' : '📦'}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg">
                                                {typeof job.title === 'object' ? (job.title.display || 'Market Job') : job.title}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-[9px] font-black uppercase">
                                                    {job.service_type}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    📍 {parseLocation(job.pickup_location).split(',')[0]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-900 italic tracking-tighter">${job.price}</p>
                                        </div>
                                        <button
                                            disabled={!isOnline}
                                            onClick={() => handleAcceptJob(job.id)}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                        >
                                            Accept ➔
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No jobs in your area</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'active' && (
                        <div className="grid grid-cols-1 gap-6">
                            {activeJobs.length > 0 ? activeJobs.map(job => (
                                <div key={job.id} className="p-8 bg-teal-600 text-white rounded-[3rem] shadow-2xl shadow-teal-100 space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-20 text-8xl">🚚</div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-100 mb-2">Live Mission</p>
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter">
                                                {typeof job.title === 'object' ? (job.title.display || 'Job') : job.title}
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black tracking-tighter italic">${job.price}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 p-6 rounded-2xl backdrop-blur-md">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-teal-200 mb-1">Pickup</p>
                                            <p className="text-sm font-bold truncate">{parseLocation(job.pickup_location)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-teal-200 mb-1">Dropoff</p>
                                            <p className="text-sm font-bold truncate">{parseLocation(job.dropoff_location)}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => handleUpdateStatus(job.id, job.transport_status === 'accepted' ? 'in_progress' : 'completed')}
                                            className="flex-1 py-5 bg-white text-teal-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all"
                                        >
                                            {job.transport_status === 'accepted' ? 'Start Journey ➔' : 'Complete Delivery ✔️'}
                                        </button>
                                        <button
                                            onClick={() => openNavigation(job.pickup_location)}
                                            className="px-8 py-5 bg-teal-500 text-white border border-teal-400 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Navigate
                                        </button>
                                        <button
                                            onClick={() => setChatJob(job)}
                                            className="px-8 py-5 bg-teal-400 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Chat
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Waiting for active orders...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'earnings' && (
                        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
                            <WalletTab />
                        </div>
                    )}

                    {activeView === 'intel' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-8 bg-indigo-600 text-white rounded-3xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</p>
                                    <p className="text-4xl font-black mt-2">{(driverSummary as any).successRate || 100}%</p>
                                </div>
                                <div className="p-8 bg-slate-900 text-white rounded-3xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Missions</p>
                                    <p className="text-4xl font-black mt-2">{(driverSummary as any).totalMissions || 0}</p>
                                </div>
                                <div className="p-8 bg-teal-600 text-white rounded-3xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Level</p>
                                    <p className="text-4xl font-black mt-2">
                                        {(driverSummary as any).totalJobs > 50 ? 'Elite' : (driverSummary as any).totalJobs > 10 ? 'Pro' : 'Rookie'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Public Work Profile</h4>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase">Verified ✨</span>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Driver Bio</p>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"Providing efficient and safe transport across the northern island. Specialized in quick courier deliveries and large group transport."</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 uppercase">Punctual</div>
                                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 uppercase">Friendly</div>
                                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 uppercase">Safe Vehicle</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'services' && (
                        <div className="space-y-6">
                            <div className="bg-linear-to-br from-indigo-600 to-teal-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Post Fixed Services 📣</h4>
                                    <p className="text-white/80 text-sm max-w-md font-medium mb-8 leading-relaxed">
                                        Want to offer "Airport Shuttles", "Full Day Tours", or "Construction Hauling"? Create a permanent Hub listing.
                                    </p>
                                    <Link href="/create?type=service">
                                        <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">
                                            List My Service
                                        </button>
                                    </Link>
                                </div>
                                <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-black">🌟</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myServices.map(service => (
                                    <div key={service.id} className="p-6 bg-white border border-slate-100 rounded-4xl flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-50 transition-colors">📦</div>
                                            <div>
                                                <p className="font-black text-slate-800">{service.title}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{service.category} • {service.status}</p>
                                            </div>
                                        </div>
                                        <Link href={`/listings/${service.id}/edit`}>
                                            <button className="p-3 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {chatJob && (
                    <DeliveryChat
                        deliveryId={chatJob.id}
                        otherUserId={chatJob.creator_id}
                        otherUserName={chatJob.creator_name || 'Customer'}
                        onClose={() => setChatJob(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues
const DispatchMap = dynamic(() => import('@/components/admin/DispatchMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-bold">Loading Map...</div>
});

export default function StandaloneDispatchPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'active'>('all');
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    const [isMounted, setIsMounted] = useState(false);

    const fetchJobs = async () => {
        try {
            const [listingsRes, ordersRes] = await Promise.all([
                api.get('/listings'),
                api.get('/admin/orders', { params: { status: 'paid', order_type: 'delivery' } })
            ]);

            const allListings = listingsRes.data.listings || [];
            const transportJobs = allListings.filter((l: any) =>
                ['pickup', 'delivery', 'taxi'].includes(l.service_type) &&
                l.transport_status !== 'completed' && l.transport_status !== 'cancelled'
            ).map((l: any) => ({
                ...l,
                source: 'listing',
                // Parse locations if they are strings
                pickup_parsed: typeof l.pickup_location === 'string' ? JSON.parse(l.pickup_location) : l.pickup_location,
                dropoff_parsed: typeof l.dropoff_location === 'string' ? JSON.parse(l.dropoff_location) : l.dropoff_location
            }));

            const deliveryOrders = (ordersRes.data.orders || []).map((o: any) => ({
                id: `order_${o.order_id}`,
                order_id: o.order_id,
                title: `Food Delivery #${o.order_id}`,
                service_type: 'delivery',
                transport_status: o.status === 'paid' ? 'pending' : (o.status === 'dispatched' ? 'accepted' : o.status),
                price: o.delivery_fee || 0,
                created_at: o.created_at,
                driver_id: o.assigned_driver_id,
                source: 'order',
                // For food orders, pickup is the store and dropoff is shipping_address
                // Note: Real geocoding would be needed for shipping_address strings
                pickup_location: o.store_name || 'Store',
                dropoff_location: o.shipping_address || 'Customer',
                pickup_parsed: { lat: 17.2948 + (Math.random() - 0.5) * 0.02, lng: -62.7261 + (Math.random() - 0.5) * 0.02 }, // Mock coords for now
                dropoff_parsed: { lat: 17.2948 + (Math.random() - 0.5) * 0.02, lng: -62.7261 + (Math.random() - 0.5) * 0.02 }
            }));

            setJobs([...transportJobs, ...deliveryOrders]);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        if (isAuthenticated === false) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'admin') {
            // router.push('/'); // Commented out to prevent flicker/redirect loops during hydration fix testing
            // return;
        }
        fetchJobs();
        const interval = setInterval(fetchJobs, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user, router]);

    // Use Set directly for unique values - no need for Array.from wrapper
    const activeDrivers = new Set(jobs.filter(j => j.driver_id).map(j => j.driver_id)).size;

    const filteredJobs = jobs.filter(job => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'pending') return job.transport_status === 'pending';
        if (selectedFilter === 'active') return ['accepted', 'in_progress'].includes(job.transport_status);
        return true;
    });

    // Hydration fix: Always render loading state on server and initial client render
    if (!isMounted || !user || user.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center">Loading Data...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Fixed Header - Below Navbar */}
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1920px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Dispatch Command Center 🛰️</h1>
                                <p className="text-sm text-slate-500 font-medium">Real-time fleet management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-3">
                                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-center">
                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Jobs</p>
                                    <p className="text-xl font-black text-indigo-600">{jobs.length}</p>
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-center">
                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Drivers</p>
                                    <p className="text-xl font-black text-teal-600">{activeDrivers}</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchJobs}
                                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                title="Refresh">
                                🔄
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                    {/* Map Section - 2/3 width */}
                    <div className={`${isMapFullscreen ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative transition-all`}>
                        <DispatchMap jobs={filteredJobs} />

                        {/* Map Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <button
                                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                                className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg hover:bg-white transition-colors"
                                title={isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                                {isMapFullscreen ? '⊟' : '⛶'}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar - 1/3 width */}
                    {!isMapFullscreen && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
                            {/* Filters */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex gap-2">
                                    {[
                                        { id: 'all', label: 'All', count: jobs.length },
                                        { id: 'pending', label: 'Pending', count: jobs.filter(j => j.transport_status === 'pending').length },
                                        { id: 'active', label: 'Active', count: jobs.filter(j => ['accepted', 'in_progress'].includes(j.transport_status)).length }
                                    ].map(filter => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setSelectedFilter(filter.id as any)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedFilter === filter.id
                                                ? 'bg-teal-600 text-white shadow-md'
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                                }`}>
                                            {filter.label} ({filter.count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Job List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {filteredJobs.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400 italic text-sm">No jobs</div>
                                ) : (
                                    filteredJobs.map(job => (
                                        <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal-200 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${job.transport_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    job.transport_status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-teal-100 text-teal-700'
                                                    }`}>
                                                    {job.transport_status}
                                                </span>
                                                <span className="text-xs font-black text-slate-400">
                                                    {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm mb-1">{job.title}</h4>
                                            <p className="text-xs text-slate-500 mb-2">{job.pickup_location} ➝ {job.dropoff_location}</p>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-[10px]">
                                                        {job.driver_id ? '👨‍✈️' : '🤖'}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600">
                                                        {job.driver_id ? `Driver #${job.driver_id}` : 'Unassigned'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-black text-teal-600">${job.price}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

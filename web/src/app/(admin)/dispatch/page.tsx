'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import AssignDriverModal from '@/components/admin/AssignDriverModal';

// Dynamically import map to avoid SSR issues
const DispatchMap = dynamic(() => import('@/components/admin/DispatchMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-[1.5rem] flex items-center justify-center text-slate-400 font-bold">Loading Map...</div>
});

export default function AdminDispatch() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [trips, setTrips] = useState<any[]>([]);
    const [pricingRules, setPricingRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dispatch' | 'trips' | 'earnings' | 'surge'>('dispatch');
    const [selectedJobForAssign, setSelectedJobForAssign] = useState<any>(null);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'scheduled'>('all');
    const [selectedJobDetails, setSelectedJobDetails] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            const [jobsRes, driversRes, pricingRes, tripsRes] = await Promise.all([
                api.get('/listings'),
                api.get('/logistics/drivers/online'),
                api.get('/logistics/pricing'),
                api.get('/drivers/trips').catch(() => ({ data: { trips: [] } }))
            ]);

            const allListings = jobsRes.data.listings || [];
            const transportJobs = allListings.filter((l: any) =>
                ['pickup', 'delivery', 'taxi'].includes(l.service_type) &&
                l.transport_status !== 'completed' && l.transport_status !== 'cancelled'
            );

            setJobs(transportJobs);
            setDrivers(driversRes.data.drivers || []);
            setPricingRules(pricingRes.data.rules || []);
            setTrips(tripsRes.data.trips || []);
        } catch (error) {
            console.error('Failed to fetch dispatch data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 20000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleUpdatePricing = async (id: number, updates: any) => {
        try {
            await api.put(`/logistics/pricing/${id}`, updates);
            toast.success('Pricing updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update pricing');
        }
    };

    const handleAssignDriver = async (jobId: number, driverId: number) => {
        try {
            await api.post(`/logistics/jobs/${jobId}/assign`, { driverId });
            toast.success('Driver manually assigned');
            setSelectedJobForAssign(null);
            fetchData();
        } catch (error) {
            toast.error('Assignment failed');
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'pending') return job.transport_status === 'pending';
        if (selectedFilter === 'active') return ['accepted', 'in_progress'].includes(job.transport_status);
        if (selectedFilter === 'completed') return job.transport_status === 'completed';
        if (selectedFilter === 'scheduled') return job.scheduled_time !== null;
        return true;
    });

    const parseLocation = (loc: any) => {
        try {
            const data = typeof loc === 'string' ? JSON.parse(loc) : loc;
            return data?.address || data?.name || String(loc);
        } catch (e) { return String(loc); }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Command Center</h2>
                    <p className="text-slate-500 font-medium">Logistics control & real-time dispatch</p>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('dispatch')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dispatch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Live Dispatch
                    </button>
                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'trips' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Trip Tracker
                    </button>
                    <button
                        onClick={() => setActiveTab('earnings')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'earnings' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Earnings
                    </button>
                    <button
                        onClick={() => setActiveTab('surge')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'surge' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Surge Rules
                    </button>
                </div>
            </header>

            {activeTab === 'dispatch' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Feed */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Live Mission Feed</h4>
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black">{jobs.length} Active</span>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {(['all', 'pending', 'active'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setSelectedFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredJobs.map(job => (
                                    <div key={job.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${job.transport_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {job.transport_status}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400">#{job.id}</span>
                                        </div>
                                        <h5 className="font-bold text-slate-900 text-sm">{job.title}</h5>
                                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                                            {parseLocation(job.pickup_location)} ➔ {parseLocation(job.dropoff_location)}
                                        </p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="text-[9px] font-black text-slate-400 uppercase">
                                                By: {job.owner_name}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => fetchData()} className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm hover:scale-110 duration-200">📍</button>
                                                <button
                                                    onClick={() => setSelectedJobForAssign(job)}
                                                    className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm font-black text-[8px] uppercase tracking-widest"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Map */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden h-[700px] relative">
                            <DispatchMap
                                jobs={filteredJobs}
                                drivers={drivers}
                                onAssignJob={(jobId, driverId) => {
                                    if (driverId === -1) {
                                        const job = jobs.find(j => j.id === jobId);
                                        if (job) setSelectedJobForAssign(job);
                                    } else {
                                        handleAssignDriver(jobId, driverId);
                                    }
                                }}
                            />

                            {/* Floating Map Legend */}
                            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl z-[1000] space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase text-slate-600">Pending Job</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase text-slate-600">Active Job</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-teal-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase text-slate-600">Online Driver</span>
                                </div>
                            </div>

                            {/* Map Control Bar */}
                            <div className="absolute top-8 right-8 flex gap-3 z-[1000]">
                                <button onClick={() => fetchData()} className="p-4 bg-white rounded-2xl shadow-xl hover:scale-105 duration-200">🔄</button>
                                <button onClick={() => setIsMapExpanded(true)} className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-105 duration-200 font-black text-[10px] uppercase tracking-widest">Fullscreen ⛶</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'surge' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pricingRules.map(rule => (
                        <div key={rule.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">
                                    {rule.service_type === 'taxi' ? '🚖' : '📦'}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${rule.is_active ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {rule.is_active ? 'Active' : 'Paused'}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase italic">{rule.service_type} Pricing</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Multiplier: {rule.surge_multiplier}x</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-400 uppercase text-[10px]">Surge Multiplier</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleUpdatePricing(rule.id, { ...rule, surge_multiplier: Math.max(1, rule.surge_multiplier - 0.1).toFixed(1) })} className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center">-</button>
                                        <span className="w-8 text-center font-black">{rule.surge_multiplier}x</span>
                                        <button onClick={() => handleUpdatePricing(rule.id, { ...rule, surge_multiplier: (parseFloat(rule.surge_multiplier) + 0.1).toFixed(1) })} className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center">+</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-400 uppercase text-[10px]">Base Fare</span>
                                    <span className="text-slate-900 font-black">${rule.base_fare}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-400 uppercase text-[10px]">Min Fare</span>
                                    <span className="text-slate-900 font-black">${rule.minimum_fare}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleUpdatePricing(rule.id, { ...rule, is_active: !rule.is_active })}
                                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${rule.is_active ? 'bg-rose-50 text-rose-600' : 'bg-teal-600 text-white shadow-lg shadow-teal-100'}`}
                            >
                                {rule.is_active ? 'Deactivate Surge' : 'Activate Rules'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* TRIPS TRACKER TAB */}
            {activeTab === 'trips' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900">Trip Timeline</h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                    {trips.filter(t => t.status === 'assigned').length} Active
                                </span>
                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                                    {trips.filter(t => t.status === 'completed').length} Completed
                                </span>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Trip ID</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Driver</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Rider</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Route</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Status</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Fare</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {trips.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                No trips yet
                                            </td>
                                        </tr>
                                    ) : (
                                        trips.slice(0, 20).map((trip: any) => (
                                            <tr key={trip.trip_id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-slate-600">{trip.trip_id}</td>
                                                <td className="px-6 py-4 text-sm font-bold">{trip.driver_name || 'Unassigned'}</td>
                                                <td className="px-6 py-4 text-sm">{trip.rider_name || '-'}</td>
                                                <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                                                    {trip.pickup_address} → {trip.dropoff_address}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                        trip.status === 'completed' ? 'bg-teal-100 text-teal-700' :
                                                        trip.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                        trip.status === 'in_transit' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {trip.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">${trip.fare_amount || '0.00'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        {['assigned', 'arrived', 'picked_up', 'in_transit', 'completed'].map((step, i) => (
                                                            <div key={step} className={`w-2 h-2 rounded-full ${
                                                                ['assigned', 'arrived', 'picked_up', 'in_transit', 'completed'].indexOf(trip.status) >= i
                                                                    ? 'bg-teal-500' : 'bg-slate-200'
                                                            }`} />
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* EARNINGS TAB */}
            {activeTab === 'earnings' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Summary Cards */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
                        <p className="text-xs font-black text-slate-400 uppercase">Today's Revenue</p>
                        <p className="text-3xl font-black text-slate-900 mt-2">
                            ${trips.filter(t => t.status === 'completed' && new Date(t.completed_at).toDateString() === new Date().toDateString())
                                .reduce((sum, t) => sum + (parseFloat(t.fare_amount) || 0), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
                        <p className="text-xs font-black text-slate-400 uppercase">Today's Trips</p>
                        <p className="text-3xl font-black text-slate-900 mt-2">
                            {trips.filter(t => t.status === 'completed' && new Date(t.completed_at).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
                        <p className="text-xs font-black text-slate-400 uppercase">Active Drivers</p>
                        <p className="text-3xl font-black text-slate-900 mt-2">{drivers.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
                        <p className="text-xs font-black text-slate-400 uppercase">Platform Fee (15%)</p>
                        <p className="text-3xl font-black text-teal-600 mt-2">
                            ${(trips.filter(t => t.status === 'completed').reduce((sum, t) => sum + (parseFloat(t.fare_amount) || 0), 0) * 0.15).toFixed(2)}
                        </p>
                    </div>

                    {/* Driver Performance */}
                    <div className="md:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-black text-slate-900">Driver Performance</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {drivers.slice(0, 6).map((driver: any) => (
                                <div key={driver.user_id} className="p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {driver.name?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{driver.name || 'Driver'}</p>
                                            <p className="text-xs text-slate-500">ID: {driver.user_id}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-black text-slate-900">
                                                {trips.filter(t => t.driver_id === driver.user_id && t.status === 'completed').length}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase">Trips</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-teal-600">
                                                ${trips.filter(t => t.driver_id === driver.user_id && t.status === 'completed')
                                                    .reduce((sum, t) => sum + (parseFloat(t.fare_amount) || 0) * 0.85, 0).toFixed(0)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase">Earned</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <AssignDriverModal
                isOpen={!!selectedJobForAssign}
                onClose={() => setSelectedJobForAssign(null)}
                drivers={drivers}
                jobTitle={selectedJobForAssign?.title || ''}
                onAssign={(driverId) => handleAssignDriver(selectedJobForAssign.id, driverId)}
            />
        </div>
    );
}

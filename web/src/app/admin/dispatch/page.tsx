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
    const [pricingRules, setPricingRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dispatch' | 'surge'>('dispatch');
    const [selectedJobForAssign, setSelectedJobForAssign] = useState<any>(null);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'scheduled'>('all');

    const fetchData = useCallback(async () => {
        try {
            const [jobsRes, driversRes, pricingRes] = await Promise.all([
                api.get('/listings'),
                api.get('/logistics/drivers/online'),
                api.get('/logistics/pricing')
            ]);

            const allListings = jobsRes.data.listings || [];
            const transportJobs = allListings.filter((l: any) =>
                ['pickup', 'delivery', 'taxi'].includes(l.service_type) &&
                l.transport_status !== 'completed' && l.transport_status !== 'cancelled'
            );

            setJobs(transportJobs);
            setDrivers(driversRes.data.drivers || []);
            setPricingRules(pricingRes.data.rules || []);
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

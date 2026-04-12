'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import DeliveryChat from '@/components/DeliveryChat';
import RatingModal from '@/components/RatingModal';
import { useAuthStore } from '@/lib/auth';
import DriverOnboarding from './DriverOnboarding';
import dynamic from 'next/dynamic';

const DispatchMap = dynamic(() => import('@/components/admin/DispatchMap'), { ssr: false });

export default function LogisticsHub() {
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatRequest, setChatRequest] = useState<any>(null);
    const [ratingRequest, setRatingRequest] = useState<any>(null);
    const [trackingJob, setTrackingJob] = useState<any>(null);

    const { user } = useAuthStore();

    const fetchData = async () => {
        try {
            const res = await api.get('/listings?service_type=taxi,delivery,pickup');
            setMyRequests(Array.isArray(res.data) ? res.data : res.data.listings || []);
        } catch (error) {
            console.error('Logistics Hub Fetch Error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (trackingJob) {
            const updated = myRequests.find(r => r.id === trackingJob.id);
            if (updated) setTrackingJob(updated);
        }
    }, [myRequests]);

    if (loading && myRequests.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600" />
                <p className="mt-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">Tracking Journeys...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">My Journeys</h2>
                    <p className="text-slate-500 text-xs font-bold">Live tracking & dispatch portal</p>
                </div>
            </header>

            {user?.role !== 'driver' && !user?.is_verified_driver && (
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-100">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">🚀</div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase italic">Become an Island Driver</h3>
                                <p className="text-white/80 font-medium text-sm">Earn on your own terms. Deliver joy across the island.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => (document.getElementById('driver-onboarding') as HTMLElement)?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
                        >
                            Start Application ➔
                        </button>
                    </div>
                </div>
            )}

            {myRequests.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4">🚖</div>
                    <h3 className="text-xl font-black text-slate-800 uppercase italic">No Active Journeys</h3>
                    <p className="text-slate-500 font-medium mb-8">Ready to explore? Book a ride or request a delivery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {myRequests.map((request: any) => {
                        const statusConfig: Record<string, { icon: string; color: string; label: string }> = {
                            pending: { icon: '⏳', color: 'bg-amber-100 text-amber-700', label: 'Finding Driver' },
                            accepted: { icon: '✅', color: 'bg-teal-100 text-teal-700', label: 'Driver Assigned' },
                            in_progress: { icon: '🚚', color: 'bg-indigo-100 text-indigo-700', label: 'In Transit' },
                            completed: { icon: '🏁', color: 'bg-slate-100 text-slate-700', label: 'Completed' },
                            cancelled: { icon: '❌', color: 'bg-rose-100 text-rose-700', label: 'Cancelled' }
                        };
                        const status = statusConfig[request.transport_status] || statusConfig.pending;
                        const serviceIcon = request.service_type === 'taxi' ? '🚖' : request.service_type === 'pickup' ? '🛻' : '📦';

                        return (
                            <div key={request.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -mr-8 -mt-8 group-hover:bg-indigo-50 transition-colors" />

                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                                            {serviceIcon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{request.title}</h3>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                                <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span>{request.service_type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-center">
                                        <div className="text-3xl font-black text-slate-900 tracking-tighter italic">${Number(request.price || 0).toFixed(2)}</div>
                                        {request.driver_name && (
                                            <div className="text-[10px] font-black text-indigo-600 mt-1 uppercase tracking-widest">
                                                Driver: {request.driver_name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    {request.driver_id && ['accepted', 'in_progress'].includes(request.transport_status) && (
                                        <>
                                            <button
                                                onClick={() => setChatRequest(request)}
                                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                            >
                                                💬 Chat
                                            </button>
                                            <button
                                                onClick={() => setTrackingJob(request)}
                                                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal-100"
                                            >
                                                📍 Live Track
                                            </button>
                                        </>
                                    )}
                                    {request.transport_status === 'completed' && !request.is_rated && (
                                        <button
                                            onClick={() => setRatingRequest(request)}
                                            className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-100"
                                        >
                                            ⭐ Rate Experience
                                        </button>
                                    )}
                                    <button className="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                                        Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {chatRequest && (
                    <DeliveryChat
                        deliveryId={chatRequest.id}
                        otherUserId={chatRequest.driver_id}
                        otherUserName={chatRequest.driver_name || 'Driver'}
                        onClose={() => setChatRequest(null)}
                    />
                )}
                {ratingRequest && (
                    <RatingModal
                        deliveryId={ratingRequest.id}
                        driverName={ratingRequest.driver_name || 'Driver'}
                        onClose={() => setRatingRequest(null)}
                        onSuccess={() => {
                            setRatingRequest(null);
                            fetchData();
                        }}
                    />
                )}
                {trackingJob && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[5000] flex items-center justify-center p-4"
                        onClick={() => setTrackingJob(null)}
                    >
                        <div className="bg-white rounded-[3rem] w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase italic">On the Way 🚀</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tracking Job #{trackingJob.id}</p>
                                </div>
                                <button onClick={() => setTrackingJob(null)} className="p-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Close ✕</button>
                            </div>
                            <div className="flex-1 bg-slate-50 relative">
                                <DispatchMap jobs={[trackingJob]} />
                                <div className="absolute top-8 left-8 p-6 bg-white rounded-3xl shadow-2xl z-[1000] border border-slate-100 max-w-xs">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">👨‍✈️</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Driver</p>
                                            <p className="font-black text-slate-800">{trackingJob.driver_name || 'Assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-teal-50 rounded-2xl">
                                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-bold text-teal-900">{trackingJob.transport_status === 'in_progress' ? 'In Transit' : 'Heading to Pickup'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {user?.role !== 'driver' && !user?.is_verified_driver && (
                <div id="driver-onboarding" className="mt-20 border-t border-slate-100 pt-20">
                    <DriverOnboarding />
                </div>
            )}
        </div>
    );
}

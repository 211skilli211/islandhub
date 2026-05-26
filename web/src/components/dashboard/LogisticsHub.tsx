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
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border-primary border-t-indigo-600" />
                <p className="mt-4 text-ink-tertiary0 font-black uppercase text-[10px] tracking-widest">Tracking Journeys...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary tracking-tight italic uppercase">My Journeys</h2>
                    <p className="text-ink-tertiary0 text-xs font-bold">Live tracking & dispatch portal</p>
                </div>
            </header>

            {user?.role !== 'driver' && !user?.is_verified_driver && (
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-100">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-surface-elevated/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">🚀</div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase italic">Become an Island Driver</h3>
                                <p className="text-white/80 font-medium text-sm">Earn on your own terms. Deliver joy across the island.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => (document.getElementById('driver-onboarding') as HTMLElement)?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-surface-elevated text-[#818cf8] rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
                        >
                            Start Application ➔
                        </button>
                    </div>
                </div>
            )}

            {myRequests.length === 0 ? (
                <div className="py-20 text-center bg-surface-secondary rounded-[3rem] border-2 border-dashed border-border-primary">
                    <div className="text-5xl mb-4">🚖</div>
                    <h3 className="text-xl font-black text-ink-primary uppercase italic">No Active Journeys</h3>
                    <p className="text-ink-tertiary0 font-medium mb-8">Ready to explore? Book a ride or request a delivery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {myRequests.map((request: any) => {
                        const statusConfig: Record<string, { icon: string; color: string; label: string }> = {
                            pending: { icon: '⏳', color: 'bg-sand-500/10 text-sand-500', label: 'Finding Driver' },
                            accepted: { icon: '✅', color: 'bg-accent-500/15 text-accent-500', label: 'Driver Assigned' },
                            in_progress: { icon: '🚚', color: 'bg-[#818cf8]/15 text-[#6366f1]', label: 'In Transit' },
                            completed: { icon: '🏁', color: 'bg-surface-secondary text-ink-secondary', label: 'Completed' },
                            cancelled: { icon: '❌', color: 'bg-[#e11d48]/10 text-[#be123c]', label: 'Cancelled' }
                        };
                        const status = statusConfig[request.transport_status] || statusConfig.pending;
                        const serviceIcon = request.service_type === 'taxi' ? '🚖' : request.service_type === 'pickup' ? '🛻' : '📦';

                        return (
                            <div key={request.id} className="p-8 bg-surface-elevated border border-border-primary rounded-[2rem] shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-surface-secondary rounded-bl-[3rem] -mr-8 -mt-8 group-hover:bg-[#818cf8]/10 transition-colors" />

                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-surface-secondary rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                                            {serviceIcon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black text-ink-primary tracking-tight">{request.title}</h3>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest flex items-center gap-2">
                                                <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-surface-tertiary rounded-full" />
                                                <span>{request.service_type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-center">
                                        <div className="text-3xl font-black text-ink-primary tracking-tighter italic">${Number(request.price || 0).toFixed(2)}</div>
                                        {request.driver_name && (
                                            <div className="text-[10px] font-black text-[#818cf8] mt-1 uppercase tracking-widest">
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
                                                className="flex-1 py-4 bg-[#818cf8] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6366f1] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                            >
                                                💬 Chat
                                            </button>
                                            <button
                                                onClick={() => setTrackingJob(request)}
                                                className="flex-1 py-4 bg-accent-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-accent-500/10"
                                            >
                                                📍 Live Track
                                            </button>
                                        </>
                                    )}
                                    {request.transport_status === 'completed' && !request.is_rated && (
                                        <button
                                            onClick={() => setRatingRequest(request)}
                                            className="flex-1 py-4 bg-sand-500/50 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sand-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-100"
                                        >
                                            ⭐ Rate Experience
                                        </button>
                                    )}
                                    <button className="px-6 py-4 bg-surface-secondary text-ink-tertiary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-surface-secondary transition-all">
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
                        <div className="bg-surface-elevated rounded-[3rem] w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="p-8 border-b border-border-primary flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-ink-primary uppercase italic">On the Way 🚀</h3>
                                    <p className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Tracking Job #{trackingJob.id}</p>
                                </div>
                                <button onClick={() => setTrackingJob(null)} className="p-4 bg-ink-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">Close ✕</button>
                            </div>
                            <div className="flex-1 bg-surface-secondary relative">
                                <DispatchMap jobs={[trackingJob]} />
                                <div className="absolute top-8 left-8 p-6 bg-surface-elevated rounded-3xl shadow-2xl z-[1000] border border-border-primary max-w-xs">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-[#818cf8]/10 rounded-2xl flex items-center justify-center text-2xl">👨‍✈️</div>
                                        <div>
                                            <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest">Your Driver</p>
                                            <p className="font-black text-ink-primary">{trackingJob.driver_name || 'Assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-accent-500/10 rounded-2xl">
                                        <p className="text-[9px] font-black text-accent-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-bold text-accent-700">{trackingJob.transport_status === 'in_progress' ? 'In Transit' : 'Heading to Pickup'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {user?.role !== 'driver' && !user?.is_verified_driver && (
                <div id="driver-onboarding" className="mt-20 border-t border-border-primary pt-20">
                    <DriverOnboarding />
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ShoppingBag, Heart, Star, LayoutGrid, Clock } from 'lucide-react';

interface PulseEvent {
    type: 'store' | 'donation' | 'milestone';
    title: string;
    subtype: string;
    timestamp: string;
    image?: string;
    value?: string;
}

export default function IslandPulse() {
    const [events, setEvents] = useState<PulseEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPulse = async () => {
            try {
                const res = await api.get('/discovery/pulse');
                setEvents(res.data);
            } catch (error) {
                console.error('Pulse fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPulse();
        const interval = setInterval(fetchPulse, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'store': return <ShoppingBag className="text-amber-500" size={14} />;
            case 'donation': return <Heart className="text-rose-500" size={14} />;
            case 'milestone': return <Zap className="text-teal-500" size={14} />;
            default: return <Star className="text-indigo-500" size={14} />;
        }
    };

    if (loading && events.length === 0) return null;

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Island Pulse</h3>
                </div>
                <LayoutGrid size={16} className="text-slate-300" />
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {events.map((event, idx) => (
                        <motion.div
                            key={`${event.type}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-50">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                            {getIcon(event.type)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-50">
                                    {getIcon(event.type)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-900 leading-tight group-hover:text-rose-500 transition-colors line-clamp-1">{event.title}</p>
                                <p className="text-[9px] text-slate-500 font-bold line-clamp-1 mt-0.5">{event.subtype}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                                        <Clock size={10} /> {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {event.value && (
                                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                                            ${parseFloat(event.value).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button className="w-full mt-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-50">
                View All Activity →
            </button>
        </div>
    );
}

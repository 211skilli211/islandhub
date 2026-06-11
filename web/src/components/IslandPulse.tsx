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
            case 'store': return <ShoppingBag className="text-sand-500" size={14} />;
            case 'donation': return <Heart className="text-[#e11d48]" size={14} />;
            case 'milestone': return <Zap className="text-accent-500" size={14} />;
            default: return <Star className="text-[#a5b4fc]0" size={14} />;
        }
    };

    if (loading && events.length === 0) return null;

    return (
        <div className="bg-surface-elevated/80 backdrop-blur-xl border border-border-primary rounded-[2.5rem] p-6 shadow-2xl shadow-black/10/50">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#e11d48]/50 rounded-full animate-ping" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-primary">Island Pulse</h3>
                </div>
                <LayoutGrid size={16} className="text-ink-tertiary" />
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
                            className="flex items-start gap-4 p-3 hover:bg-surface-secondary rounded-2xl transition-colors cursor-pointer group"
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-surface-secondary overflow-hidden border border-border-primary">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-secondary text-ink-tertiary">
                                            {getIcon(event.type)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface-elevated rounded-full shadow-sm flex items-center justify-center border border-border-primary">
                                    {getIcon(event.type)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-ink-primary leading-tight group-hover:text-[#e11d48] transition-colors line-clamp-1">{event.title}</p>
                                <p className="text-[9px] text-ink-tertiary font-bold line-clamp-1 mt-0.5">{event.subtype}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] font-black text-ink-tertiary uppercase flex items-center gap-1">
                                        <Clock size={10} /> {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {event.value && (
                                        <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                                            ${parseFloat(event.value).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button className="w-full mt-4 py-3 text-[9px] font-black uppercase tracking-widest text-ink-tertiary hover:text-ink-secondary transition-colors border-t border-border-primary">
                View All Activity →
            </button>
        </div>
    );
}

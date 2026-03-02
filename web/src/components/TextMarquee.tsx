
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TextMarquee() {
    const [marquees, setMarquees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [direction, setDirection] = useState<'normal' | 'reverse'>('normal');
    const [speed, setSpeed] = useState(1);

    useEffect(() => {
        const fetchMarquees = async () => {
            try {
                const res = await api.get('/marquee');
                const data = res.data;

                if (data.items) {
                    setMarquees(data.items);
                    if (data.settings) {
                        setIsPlaying(data.settings.isPlaying);
                        setDirection(data.settings.direction);
                        setSpeed(data.settings.speed);
                    }
                } else if (Array.isArray(data)) {
                    setMarquees(data);
                }
            } catch (error) {
                console.error('Failed to fetch marquees', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarquees();

        // Refresh every minute to stay current with start/end dates
        const interval = setInterval(fetchMarquees, 60000);
        return () => clearInterval(interval);
    }, []);

    // Simplified check: always render the container if we have marquees, but don't hold up for loading
    if (marquees.length === 0 && !loading) return null;

    return (
        <div className="bg-slate-900 overflow-hidden py-3 sticky top-20 z-40 border-b border-indigo-500/30 backdrop-blur-md bg-opacity-95">
            <div
                className="flex whitespace-nowrap"
                style={{
                    animationName: 'marquee',
                    animationDuration: `${40 / (speed || 1)}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDirection: direction,
                    animationPlayState: isPlaying ? 'running' : 'paused'
                }}
            >
                {/* Repeat segments to ensure seamless loop */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex shrink-0 items-center">
                        {marquees.map((m, idx) => (
                            <div key={`${i}-${idx}`} className="flex items-center mx-12">
                                <span className="w-2 h-2 rounded-full bg-teal-400 mr-4 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                <span className="text-white font-black uppercase text-[10px] tracking-widest leading-none">
                                    {m.user_name && <span className="text-teal-400 mr-2">[{m.user_name}]</span>}
                                    {m.message}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Edge Fades */}
            <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-slate-900 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-slate-900 to-transparent z-10" />

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

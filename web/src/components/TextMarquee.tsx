
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const PRESETS: Record<string, any> = {
    island_orange: {
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        textColor: '#ffffff',
        accentColor: '#ffffff',
        glow: 'rgba(249, 115, 22, 0.4)',
        dot: 'bg-white',
        text: 'text-white'
    },
    highland_dark: {
        background: 'linear-gradient(135deg, #111827 0%, #000000 100%)',
        textColor: '#ffffff',
        accentColor: '#f97316',
        glow: 'rgba(249, 115, 22, 0.2)',
        dot: 'bg-orange-500',
        text: 'text-white',
        fadeFrom: 'from-black'
    },
    ocean_breeze: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
        textColor: '#ffffff',
        accentColor: '#7dd3fc',
        glow: 'rgba(14, 165, 233, 0.4)',
        dot: 'bg-sky-300',
        text: 'text-white',
        fadeFrom: 'from-blue-900'
    },
    sunset_glow: {
        background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
        textColor: '#ffffff',
        accentColor: '#fbcfe8',
        glow: 'rgba(219, 39, 119, 0.4)',
        dot: 'bg-pink-300',
        text: 'text-white',
        fadeFrom: 'from-purple-900'
    },
    neon_green: {
        background: 'linear-gradient(135deg, #000000 0%, #064e3b 100%)',
        textColor: '#39ff14',
        accentColor: '#39ff14',
        glow: 'rgba(57, 255, 20, 0.4)',
        dot: 'bg-[#39ff14]',
        text: 'text-[#39ff14]',
        fadeFrom: 'from-black',
        shadow: '0 0 15px rgba(57, 255, 20, 0.5)'
    },
    sky_blue: {
        background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)',
        textColor: '#7dd3fc',
        accentColor: '#ffffff',
        glow: 'rgba(125, 211, 252, 0.4)',
        dot: 'bg-white',
        text: 'text-sky-300',
        fadeFrom: 'from-sky-950',
        shadow: '0 0 15px rgba(125, 211, 252, 0.5)'
    },
    white_black: {
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
        textColor: '#000000',
        accentColor: '#6366f1',
        glow: 'rgba(99, 102, 241, 0.2)',
        dot: 'bg-indigo-600',
        text: 'text-black',
        fadeFrom: 'from-white'
    },
    black_white: {
        background: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)',
        textColor: '#ffffff',
        accentColor: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.3)',
        dot: 'bg-sky-400',
        text: 'text-white',
        fadeFrom: 'from-black'
    }
};

export default function TextMarquee() {
    const [marquees, setMarquees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [direction, setDirection] = useState<'normal' | 'reverse'>('normal');
    const [speed, setSpeed] = useState(1);
    const [activePreset, setActivePreset] = useState('island_orange');

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
                        setActivePreset(data.settings.preset || 'island_orange');
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

        const interval = setInterval(fetchMarquees, 60000);
        return () => clearInterval(interval);
    }, []);

    if (marquees.length === 0 && !loading) return null;

    const style = PRESETS[activePreset] || PRESETS.island_orange;

    return (
        <div
            className="overflow-hidden py-3 sticky top-20 z-40 border-b backdrop-blur-md shadow-sm"
            style={{ background: style.background, boxShadow: style.shadow }}
            data-marquee
        >
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
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex shrink-0 items-center">
                        {marquees.map((m, idx) => (
                            <div key={`${i}-${idx}`} className="flex items-center mx-12">
                                <span className={`w-2.5 h-2.5 rounded-full mr-4 ${style.dot}`} style={{ backgroundColor: m.text_color || undefined }} />
                                <span
                                    className={`${style.text} font-black uppercase text-[11px] tracking-[0.15em] leading-none transition-colors duration-500`}
                                    style={{ color: m.text_color || undefined, textShadow: m.text_color ? `0 0 10px ${m.text_color}40` : style.shadow }}
                                >
                                    {m.user_name && <span className="mr-2 opacity-60 font-medium">[{m.user_name}]</span>}
                                    {m.message}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Premium Edge Fades */}
            <div className={`absolute inset-y-0 left-0 w-32 bg-linear-to-r ${style.fadeFrom} to-transparent z-10`} />
            <div className={`absolute inset-y-0 right-0 w-32 bg-linear-to-l ${style.fadeFrom} to-transparent z-10`} />

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

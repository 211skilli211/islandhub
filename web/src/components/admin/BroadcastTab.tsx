
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { AdminTable, Column } from './shared/AdminTable';
import { ChevronRight, Plus } from 'lucide-react';

interface Marquee {
    marquee_id: number;
    message: string;
    priority: number;
    is_active: boolean;
    text_color?: string;
    emoji?: string;
    created_at: string;
}

export default function BroadcastTab() {
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/admin/marquee/templates');
            setTemplates(res.data);
        } catch (error) {
            console.error('Failed to fetch templates', error);
        }
    };

    const [newMarquee, setNewMarquee] = useState('');
    const [priority, setPriority] = useState(1);
    const [marqueeTextColor, setMarqueeTextColor] = useState('#0f766e');
    const [marqueeEmoji, setMarqueeEmoji] = useState('📢');
    const [currentMarquee, setCurrentMarquee] = useState<Marquee | null>(null);

    // Global Controls State
    const [controls, setControls] = useState({
        isPlaying: true,
        direction: 'normal',
        speed: 1, // 1 = normal, 2 = fast, 0.5 = slow
        preset: 'white_black' // Default to white_black instead of island_orange
    });

    const updateControls = async (updates: any) => {
        const newControls = { ...controls, ...updates };
        setControls(newControls);
        try {
            await api.post('/marquee/settings', newControls);
            toast.success('Marquee settings updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        }
    };

    const PRESETS = [
        { id: 'island_orange', label: 'Island Orange', icon: '🟠' },
        { id: 'highland_dark', label: 'Highland Dark', icon: '⚫' },
        { id: 'ocean_breeze', label: 'Ocean Breeze', icon: '🌊' },
        { id: 'sunset_glow', label: 'Sunset Glow', icon: '🌅' },
        { id: 'neon_green', label: 'Neon Green', icon: '🟢' },
        { id: 'sky_blue', label: 'Sky Blue', icon: '🔵' },
        { id: 'white_black', label: 'White / Black', icon: '⚪' },
        { id: 'black_white', label: 'Black / White', icon: '⚫' },
    ];

    useEffect(() => {
        fetchCurrentMarquee();
    }, []);

    const fetchCurrentMarquee = async () => {
        try {
            const res = await api.get('/marquee');
            const data = res.data;
            const items = data.items || (Array.isArray(data) ? data : []);

            if (data.settings) {
                setControls(data.settings);
            }

            const active = items.find((m: any) => m.is_active);
            if (active) setCurrentMarquee(active);
        } catch (e) { console.error(e); }
    };

    const handlePostMarquee = async (message: string) => {
        try {
            await api.post('/marquee', { message, priority, text_color: marqueeTextColor, emoji: marqueeEmoji });
            toast.success('Marquee broadcasted successfully!');
            setNewMarquee('');
            fetchCurrentMarquee();
            // Trigger table refresh
            window.dispatchEvent(new CustomEvent('refresh-marquees'));
        } catch (error) {
            toast.error('Failed to post marquee');
        }
    };

    const marqueeColumns: Column<Marquee>[] = [
        { header: 'ID', accessor: 'marquee_id', className: 'w-16 text-ink-tertiary' },
        { header: 'Message', accessor: (m) => <span className="font-bold text-ink-primary">{m.message}</span> },
        {
            header: 'Priority',
            accessor: (m) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${m.priority > 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    Level {m.priority}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (m) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-surface-secondary text-ink-tertiary'
                    }`}>
                    {m.is_active ? 'Live' : 'Hidden'}
                </span>
            )
        },
        { header: 'Created', accessor: (m) => new Date(m.created_at).toLocaleDateString() }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Global Controls */}
            <div className="bg-ink-primary text-white p-6 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#14b8a6]/100/20 text-[#14b8a6] rounded-2xl flex items-center justify-center text-2xl">🎛️</div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-white">Marquee Controls</h3>
                        <p className="text-sm text-ink-tertiary font-medium">Manage global scrolling behavior</p>
                    </div>
                </div>
                <div className="flex bg-surface-tertiary p-1.5 rounded-2xl gap-2 items-center">
                    <div className="relative">
                        <select
                            value={controls.preset}
                            onChange={(e) => updateControls({ preset: e.target.value })}
                            className="bg-ink-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-border-primary outline-none appearance-none pr-10 hover:bg-surface-tertiary transition-all cursor-pointer shadow-lg"
                        >
                            {PRESETS.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.icon} {p.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-tertiary">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>
                    <div className="w-px bg-surface-tertiary h-6 mx-1" />
                    <button
                        onClick={() => updateControls({ direction: controls.direction === 'normal' ? 'reverse' : 'normal' })}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${controls.direction === 'reverse' ? 'bg-[#14b8a6] text-white shadow-lg' : 'text-ink-tertiary hover:bg-surface-tertiary'}`}
                    >
                        {controls.direction === 'normal' ? '⬅️ Left' : '➡️ Right'}
                    </button>
                    <div className="w-px bg-surface-tertiary h-6 mx-1" />
                    <button
                        onClick={() => updateControls({ isPlaying: !controls.isPlaying })}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!controls.isPlaying ? 'bg-sand-500/50 text-white shadow-lg' : 'text-ink-tertiary hover:bg-surface-tertiary'}`}
                    >
                        {controls.isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                </div>
            </div>

            {/* Current Status Banner */}
            {currentMarquee && (
                <div className="bg-gradient-to-r from-teal-500/10 to-teal-500/10 border border-teal-100 p-6 rounded-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent-500/100 text-white rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-accent-500/15 text-lg">📢</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent-400 mb-0.5">Live On Platform</p>
                            <p className="font-bold text-ink-primary italic">"{currentMarquee.message}"</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setNewMarquee(currentMarquee.message);
                                setPriority(currentMarquee.priority);
                            }}
                            className="px-4 py-2 bg-surface-elevated text-ink-secondary rounded-xl text-[10px] font-black uppercase tracking-widest border border-border-primary hover:bg-surface-secondary transition-all"
                        >
                            Copy to Editor
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Broadcast Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-surface-elevated p-8 rounded-[2.5rem] border border-border-primary shadow-xl shadow-black/10/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-[#14b8a6]/10 text-[#14b8a6] rounded-2xl flex items-center justify-center text-xl">📢</div>
                        <div>
                            <h3 className="text-xl font-black text-ink-primary">Global Broadcast</h3>
                            <p className="text-sm text-ink-tertiary font-medium">Post live updates to the platform-wide marquee</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <textarea
                            value={newMarquee}
                            onChange={(e) => setNewMarquee(e.target.value)}
                            placeholder="What's the buzz on the island today?"
                            className="w-full h-32 p-4 bg-surface-secondary border border-border-primary rounded-3xl text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#14b8a6] transition-all resize-none font-medium"
                        />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center justify-between w-full md:w-auto gap-3 bg-surface-secondary px-4 py-3 rounded-2xl border border-border-primary">
                                <span className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest">Priority</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value))}
                                    className="flex-1 md:w-24 accent-teal-600 mx-2"
                                />
                                <span className="font-black text-[#14b8a6] text-sm w-4 text-center">{priority}</span>
                            </div>

                            {/* Color and Emoji Picker */}
                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                                {/* Emoji Picker */}
                                <div className="flex items-center gap-1 bg-surface-secondary px-3 py-2 rounded-xl border border-border-primary">
                                    <span className="text-xs font-black text-ink-tertiary uppercase tracking-widest mr-2">Icon</span>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('📢')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '📢' ? 'bg-[#14b8a6]/15 ring-2 ring-teal-500' : 'hover:bg-surface-tertiary'}`}
                                    >
                                        📢
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('🔥')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '🔥' ? 'bg-sand-500/10 ring-2 ring-amber-500' : 'hover:bg-surface-tertiary'}`}
                                    >
                                        🔥
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('⭐')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '⭐' ? 'bg-yellow-100 ring-2 ring-yellow-500' : 'hover:bg-surface-tertiary'}`}
                                    >
                                        ⭐
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('🎉')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '🎉' ? 'bg-pink-100 ring-2 ring-pink-500' : 'hover:bg-surface-tertiary'}`}
                                    >
                                        🎉
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('🏝️')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '🏝️' ? 'bg-accent-500/15 ring-2 ring-teal-500' : 'hover:bg-surface-tertiary'}`}
                                    >
                                        🏝️
                                    </button>
                                </div>

                                {/* Color Picker */}
                                <div className="flex flex-wrap items-center gap-2 bg-surface-secondary px-3 py-2 rounded-xl border border-border-primary max-w-full">
                                    <span className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest mr-1">Text Color</span>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#0f766e')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#0f766e' ? 'ring-2 ring-offset-2 ring-teal-500' : ''}`}
                                        style={{ backgroundColor: '#0f766e' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#14b8a6')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#14b8a6' ? 'ring-2 ring-offset-2 ring-teal-500' : ''}`}
                                        style={{ backgroundColor: '#14b8a6' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#f59e0b')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#f59e0b' ? 'ring-2 ring-offset-2 ring-amber-500' : ''}`}
                                        style={{ backgroundColor: '#f59e0b' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#ef4444')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#ef4444' ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}
                                        style={{ backgroundColor: '#ef4444' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#39ff14')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#39ff14' ? 'ring-2 ring-offset-2 ring-green-400' : ''}`}
                                        style={{ backgroundColor: '#39ff14' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#7dd3fc')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#7dd3fc' ? 'ring-2 ring-offset-2 ring-sky-300' : ''}`}
                                        style={{ backgroundColor: '#7dd3fc' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#ffffff')}
                                        className={`w-6 h-6 rounded-full transition-all border border-border-primary ${marqueeTextColor === '#ffffff' ? 'ring-2 ring-offset-2 ring-ink-300 dark:ring-ink-600' : ''}`}
                                        style={{ backgroundColor: '#ffffff' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#a855f7')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#a855f7' ? 'ring-2 ring-offset-2 ring-teal-500' : ''}`}
                                        style={{ backgroundColor: '#a855f7' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#ec4899')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#ec4899' ? 'ring-2 ring-offset-2 ring-pink-500' : ''}`}
                                        style={{ backgroundColor: '#ec4899' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#0ea5e9')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#0ea5e9' ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`}
                                        style={{ backgroundColor: '#0ea5e9' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#ff0033')}
                                        className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#ff0033' ? 'ring-2 ring-offset-2 ring-red-600' : ''}`}
                                        style={{ backgroundColor: '#ff0033' }}
                                    />
                                    <input
                                        type="color"
                                        value={marqueeTextColor}
                                        onChange={(e) => setMarqueeTextColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                                        title="Custom Color"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handlePostMarquee(newMarquee)}
                            disabled={!newMarquee}
                            className="w-full sm:w-auto px-6 py-3 bg-[#14b8a6] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-teal-100 hover:bg-[#14b8a6] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 whitespace-nowrap"
                        >
                            Launch Broadcast 🚀
                        </button>
                        <button
                            onClick={async () => {
                                const name = prompt('Template Name:');
                                if (!name) return;
                                await api.post('/admin/marquee/templates', { name, content: newMarquee, priority });
                                toast.success('Template saved');
                                fetchTemplates();
                            }}
                            disabled={!newMarquee}
                            className="w-full sm:w-auto px-6 py-3 bg-surface-secondary text-ink-secondary font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-surface-tertiary transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            Save Template
                        </button>
                    </div>
                </div>

                {/* Templates Sidebar - 3rd column */}
                <div className="bg-ink-primary p-8 rounded-[2.5rem] text-white shadow-2xl overflow-y-auto max-h-[500px]">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="text-sand-400">✨</span> Templates
                    </h3>
                    <div className="space-y-4">
                        {templates.map(tmp => (
                            <div key={tmp.template_id} className="relative group">
                                <button
                                    onClick={() => {
                                        setNewMarquee(tmp.content);
                                        setPriority(tmp.priority);
                                    }}
                                    className="w-full p-4 bg-surface-elevated/5 border border-white/10 rounded-2xl hover:bg-surface-elevated/10 transition-all text-left group"
                                >
                                    <div className="text-xs font-black text-sand-400 uppercase tracking-widest mb-1 group-hover:text-sand-300">{tmp.name}</div>
                                    <div className="text-sm text-ink-tertiary line-clamp-2 font-medium">{tmp.content}</div>
                                </button>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={async () => {
                                            const newContent = prompt('Edit Content:', tmp.content);
                                            if (newContent) {
                                                await api.patch(`/admin/marquee/templates/${tmp.template_id}`, { content: newContent });
                                                toast.success('Template updated');
                                                fetchTemplates();
                                            }
                                        }}
                                        className="p-1.5 bg-[#14b8a6]/100/20 text-[#14b8a6] rounded-lg scale-75 hover:scale-90 transition-all"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete template?')) {
                                                await api.delete(`/admin/marquee/templates/${tmp.template_id}`);
                                                fetchTemplates();
                                            }
                                        }}
                                        className="p-1.5 bg-red-500/20 text-red-500 rounded-lg scale-75 hover:scale-90 transition-all"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Marquee History */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-2xl font-black text-ink-primary tracking-tight">Broadcast History</h3>
                        <p className="text-sm font-medium text-ink-tertiary">Manage active and past announcements</p>
                    </div>
                </div>

                <div className="bg-surface-elevated rounded-[2.5rem] border border-border-primary shadow-xl shadow-black/10/50 overflow-hidden">
                    <AdminTable<Marquee>
                        endpoint="/marquee"
                        keyName="marquees"
                        idKey="marquee_id"
                        columns={marqueeColumns}
                        rowActions={[
                            { label: 'Deactivate', action: 'toggle', condition: (m) => m.is_active, className: 'text-sand-500 bg-sand-500/5' },
                            { label: 'Activate', action: 'toggle', condition: (m) => !m.is_active, className: 'text-green-600 bg-green-50' },
                            { label: 'Delete', action: 'delete', className: 'text-red-500 bg-red-50' }
                        ]}
                        onRowAction={async (action, item) => {
                            if (action === 'delete') {
                                if (confirm('Delete marquee?')) await api.delete(`/marquee/${item.marquee_id}`);
                            } else if (action === 'toggle') {
                                await api.patch(`/marquee/${item.marquee_id}`, { is_active: !item.is_active });
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

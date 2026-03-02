
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AdminTable, Column } from './shared/AdminTable';

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
        speed: 1 // 1 = normal, 2 = fast, 0.5 = slow
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
        { header: 'ID', accessor: 'marquee_id', className: 'w-16 text-slate-400' },
        { header: 'Message', accessor: (m) => <span className="font-bold text-slate-800">{m.message}</span> },
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
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
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
            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl">🎛️</div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-white">Marquee Controls</h3>
                        <p className="text-sm text-slate-400 font-medium">Manage global scrolling behavior</p>
                    </div>
                </div>
                <div className="flex bg-slate-800 p-1.5 rounded-2xl gap-2">
                    <button
                        onClick={() => updateControls({ direction: controls.direction === 'normal' ? 'reverse' : 'normal' })}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${controls.direction === 'reverse' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        {controls.direction === 'normal' ? '⬅️ Left' : '➡️ Right'}
                    </button>
                    <div className="w-px bg-slate-700 my-1" />
                    <button
                        onClick={() => updateControls({ isPlaying: !controls.isPlaying })}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!controls.isPlaying ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        {controls.isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                </div>
            </div>

            {/* Current Status Banner */}
            {currentMarquee && (
                <div className="bg-linear-to-r from-teal-500/10 to-indigo-500/10 border border-teal-100 p-6 rounded-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-teal-200 text-lg">📢</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-0.5">Live On Platform</p>
                            <p className="font-bold text-slate-800 italic">"{currentMarquee.message}"</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setNewMarquee(currentMarquee.message);
                                setPriority(currentMarquee.priority);
                            }}
                            className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
                        >
                            Copy to Editor
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Broadcast Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">📢</div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Global Broadcast</h3>
                            <p className="text-sm text-slate-400 font-medium">Post live updates to the platform-wide marquee</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <textarea
                            value={newMarquee}
                            onChange={(e) => setNewMarquee(e.target.value)}
                            placeholder="What's the buzz on the island today?"
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-3xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-medium"
                        />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center justify-between w-full md:w-auto gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value))}
                                    className="flex-1 md:w-24 accent-indigo-600 mx-2"
                                />
                                <span className="font-black text-indigo-600 text-sm w-4 text-center">{priority}</span>
                            </div>

                            {/* Color and Emoji Picker */}
                            <div className="flex items-center gap-2">
                                {/* Emoji Picker */}
                                <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Icon</span>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('📢')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '📢' ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-200'}`}
                                    >
                                        📢
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('🔥')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '🔥' ? 'bg-amber-100 ring-2 ring-amber-500' : 'hover:bg-slate-200'}`}
                                    >
                                        🔥
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('⭐')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '⭐' ? 'bg-yellow-100 ring-2 ring-yellow-500' : 'hover:bg-slate-200'}`}
                                    >
                                        ⭐
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('🎉')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '🎉' ? 'bg-pink-100 ring-2 ring-pink-500' : 'hover:bg-slate-200'}`}
                                    >
                                        🎉
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeEmoji('🏝️')}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${marqueeEmoji === '🏝️' ? 'bg-teal-100 ring-2 ring-teal-500' : 'hover:bg-slate-200'}`}
                                    >
                                        🏝️
                                    </button>
                                </div>

                                {/* Color Picker */}
                                <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Color</span>
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#0f766e')}
                                        className={`w-8 h-8 rounded-full transition-all ${marqueeTextColor === '#0f766e' ? 'ring-2 ring-offset-2 ring-teal-500' : ''}`}
                                        style={{ backgroundColor: '#0f766e' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#6366f1')}
                                        className={`w-8 h-8 rounded-full transition-all ${marqueeTextColor === '#6366f1' ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                        style={{ backgroundColor: '#6366f1' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#f59e0b')}
                                        className={`w-8 h-8 rounded-full transition-all ${marqueeTextColor === '#f59e0b' ? 'ring-2 ring-offset-2 ring-amber-500' : ''}`}
                                        style={{ backgroundColor: '#f59e0b' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#ef4444')}
                                        className={`w-8 h-8 rounded-full transition-all ${marqueeTextColor === '#ef4444' ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}
                                        style={{ backgroundColor: '#ef4444' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMarqueeTextColor('#1e293b')}
                                        className={`w-8 h-8 rounded-full transition-all ${marqueeTextColor === '#1e293b' ? 'ring-2 ring-offset-2 ring-slate-500' : ''}`}
                                        style={{ backgroundColor: '#1e293b' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handlePostMarquee(newMarquee)}
                            disabled={!newMarquee}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 whitespace-nowrap"
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
                            className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            Save Template
                        </button>
                    </div>
                </div>

                {/* Templates Sidebar - 3rd column */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl overflow-y-auto max-h-[500px]">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="text-amber-400">✨</span> Templates
                    </h3>
                    <div className="space-y-4">
                        {templates.map(tmp => (
                            <div key={tmp.template_id} className="relative group">
                                <button
                                    onClick={() => {
                                        setNewMarquee(tmp.content);
                                        setPriority(tmp.priority);
                                    }}
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1 group-hover:text-amber-300">{tmp.name}</div>
                                    <div className="text-sm text-slate-400 line-clamp-2 font-medium">{tmp.content}</div>
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
                                        className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg scale-75 hover:scale-90 transition-all"
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
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Broadcast History</h3>
                        <p className="text-sm font-medium text-slate-400">Manage active and past announcements</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <AdminTable<Marquee>
                        endpoint="/marquee"
                        keyName="marquees"
                        idKey="marquee_id"
                        columns={marqueeColumns}
                        rowActions={[
                            { label: 'Deactivate', action: 'toggle', condition: (m) => m.is_active, className: 'text-amber-600 bg-amber-50' },
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

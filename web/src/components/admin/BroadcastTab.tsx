'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { AdminTable, Column } from './shared/AdminTable';
import { ChevronRight, Plus, Type, AlignLeft } from 'lucide-react';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import TypeWriter from '@/components/ui/TypeWriter';

interface Marquee {
    marquee_id: number;
    message: string;
    priority: number;
    is_active: boolean;
    text_color?: string;
    emoji?: string;
    created_at: string;
}

const marqueeColumns: Column<Marquee>[] = [
    { key: 'marquee_id', header: 'ID', className: 'w-16' },
    { key: 'message', header: 'Message', className: 'flex-1' },
    { key: 'priority', header: 'Priority', className: 'w-24' },
    { key: 'is_active', header: 'Status', className: 'w-28', render: (m) => m.is_active ? <span className="text-green-600 font-medium">Active</span> : <span className="text-red-600 font-medium">Inactive</span> },
    { key: 'created_at', header: 'Created', className: 'w-40', render: (m) => new Date(m.created_at).toLocaleString() },
];

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
        preset: 'white_black', // Default to white_black instead of island_orange
        displayMode: 'scroll' as 'scroll' | 'typewriter',
    });

    const handlePostMarquee = async (message: string) => {
        if (!message.trim()) return;
        try {
            await api.post('/marquee', {
                message: message.trim(),
                priority,
                text_color: marqueeTextColor,
                emoji: marqueeEmoji,
            });
            toast.success('Broadcast sent!');
            setNewMarquee('');
        } catch (error) {
            console.error('Failed to post marquee', error);
            toast.error('Failed to send broadcast');
        }
    };

    const handleUpdateGlobalControls = async (key: string, value: any) => {
        setControls(prev => ({ ...prev, [key]: value }));
        try {
            await api.patch('/marquee/global-controls', { [key]: value });
        } catch (error) {
            console.error(`Failed to update ${key}`, error);
        }
    };

    const presets = [
        { id: 'white_black', label: 'White on Black', bg: 'bg-black', text: 'text-white', emoji: '⚪' },
        { id: 'island_orange', label: 'Island Orange', bg: 'bg-orange-500', text: 'text-white', emoji: '🟠' },
        { id: 'ocean_teal', label: 'Ocean Teal', bg: 'bg-teal-500', text: 'text-white', emoji: '🟢' },
        { id: 'sunset_pink', label: 'Sunset Pink', bg: 'bg-pink-500', text: 'text-white', emoji: '🌸' },
        { id: 'forest_green', label: 'Forest Green', bg: 'bg-green-600', text: 'text-white', emoji: '🌲' },
        { id: 'royal_purple', label: 'Royal Purple', bg: 'bg-purple-600', text: 'text-white', emoji: '💜' },
    ];

    const emojis = ['📢', '🔥', '⚡', '🌟', '💰', '🎉', '🚀', '💎', '🏝️', '🌊', '☀️', '🌙', '⚠️', '✅', '🔔', '📣', '🎯', '💡', '🎁', '🏆', '🌈', '⭐', '💥', '🎪', '🎨', '🎭', '🎮', '🎲', '🎪', '🎪'];

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-theme-primary tracking-tight">Broadcast Center</h2>
                    <p className="text-theme-secondary mt-1">Manage global announcements, marquees, and live broadcasts</p>
                </div>
            </div>

            {/* Live on Platform Card */}
            <div className="bg-card border border-border-primary rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-black text-theme-primary mb-4 flex items-center gap-2">
                    <EmojiIcon emoji="📡" size={20} /> Live on Platform
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between min-w-0">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-theme-primary text-wrap break-words">
                            {currentMarquee?.message || 'No active broadcast'}
                        </p>
                        <p className="text-xs text-theme-tertiary mt-1">
                            Priority: {currentMarquee?.priority || 'N/A'} | 
                            {currentMarquee?.is_active ? '🟢 Live' : '🔴 Paused'}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={async () => {
                                if (currentMarquee) {
                                    await api.patch(`/marquee/${currentMarquee.marquee_id}`, { is_active: !currentMarquee.is_active });
                                    toast.success(currentMarquee.is_active ? 'Broadcast paused' : 'Broadcast resumed');
                                }
                            }}
                            disabled={!currentMarquee}
                            className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {currentMarquee?.is_active ? 'Pause' : 'Resume'}
                        </button>
                        <button
                            onClick={async () => {
                                if (currentMarquee && confirm('Deactivate this broadcast?')) {
                                    await api.patch(`/marquee/${currentMarquee.marquee_id}`, { is_active: false });
                                    toast.success('Broadcast deactivated');
                                }
                            }}
                            disabled={!currentMarquee}
                            className="px-4 py-2 bg-danger-primary text-white rounded-lg font-medium hover:bg-danger-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            Deactivate
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Marquee Controls */}
            <div className="bg-card border border-border-primary rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-black text-theme-primary mb-6 flex items-center gap-2">
                    <EmojiIcon emoji="🎛️" size={20} /> Global Marquee Controls
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-theme-secondary mb-3">Animation Preset</label>
                        <div className="flex flex-wrap gap-3">
                            {presets.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => handleUpdateGlobalControls('preset', preset.id)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                        controls.preset === preset.id
                                            ? 'ring-2 ring-accent-primary border-accent-primary shadow-lg shadow-accent-primary/20'
                                            : 'border-border-primary hover:border-accent-primary/50'
                                    }`}
                                >
                                    <span className={`w-3 h-3 rounded-full ${preset.bg}`} />
                                    <span className="text-sm font-medium text-theme-primary">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Play/Pause</label>
                            <select
                                value={controls.isPlaying ? 'play' : 'pause'}
                                onChange={(e) => handleUpdateGlobalControls('isPlaying', e.target.value === 'play')}
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-input text-theme-primary focus:outline-none focus:border-accent-primary/50"
                            >
                                <option value="play">▶️ Playing</option>
                                <option value="pause">⏸️ Paused</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Direction</label>
                            <select
                                value={controls.direction}
                                onChange={(e) => handleUpdateGlobalControls('direction', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-input text-theme-primary focus:outline-none focus:border-accent-primary/50"
                            >
                                <option value="normal">➡️ Left to Right</option>
                                <option value="reverse">⬅️ Right to Left</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Speed</label>
                            <select
                                value={controls.speed}
                                onChange={(e) => handleUpdateGlobalControls('speed', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-input text-theme-primary focus:outline-none focus:border-accent-primary/50"
                            >
                                <option value={0.5}>🐌 Slow (0.5x)</option>
                                <option value={1}>🚶 Normal (1x)</option>
                                <option value={2}>🏃 Fast (2x)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-theme-secondary mb-3">Display Mode</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleUpdateGlobalControls('displayMode', 'scroll')}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                                    controls.displayMode === 'scroll'
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary'
                                }`}
                            >
                                📜 Scroll
                            </button>
                            <button
                                onClick={() => handleUpdateGlobalControls('displayMode', 'typewriter')}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                                    controls.displayMode === 'typewriter'
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary'
                                }`}
                            >
                                ⌨️ Typewriter
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border-primary">
                        <TypeWriter
                            text={currentMarquee?.message || 'Your broadcast will appear here...'}
                            speed={50}
                            className="text-lg font-medium text-theme-primary min-h-[2rem]"
                        />
                    </div>
                </div>
            </div>

            {/* Create New Broadcast */}
            <div className="bg-card border border-border-primary rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-black text-theme-primary mb-6 flex items-center gap-2">
                    <EmojiIcon emoji="✍️" size={20} /> Create New Broadcast
                </h3>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-theme-secondary mb-2">Message</label>
                        <textarea
                            value={newMarquee}
                            onChange={(e) => setNewMarquee(e.target.value)}
                            placeholder="Enter your broadcast message..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-border-primary bg-input text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:border-accent-primary/50 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(parseInt(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-input text-theme-primary focus:outline-none focus:border-accent-primary/50"
                            >
                                <option value={1}>🔴 High</option>
                                <option value={2}>🟡 Medium</option>
                                <option value={3}>🟢 Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Text Color</label>
                            <div className="flex flex-wrap items-center gap-2 bg-theme-tertiary px-3 py-2 rounded-xl border border-theme-primary max-w-full">
                                <span className="text-[10px] font-black text-icon-tertiary uppercase tracking-widest mr-1">Text Color</span>
                                <button
                                    type="button"
                                    onClick={() => setMarqueeTextColor('#0f766e')}
                                    className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#0f766e' ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                                    style={{ backgroundColor: '#0f766e' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMarqueeTextColor('#ffffff')}
                                    className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#ffffff' ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                                    style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMarqueeTextColor('#fef08a')}
                                    className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#fef08a' ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                                    style={{ backgroundColor: '#fef08a' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMarqueeTextColor('#fca5a5')}
                                    className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#fca5a5' ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                                    style={{ backgroundColor: '#fca5a5' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMarqueeTextColor('#a5f3fc')}
                                    className={`w-6 h-6 rounded-full transition-all ${marqueeTextColor === '#a5f3fc' ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                                    style={{ backgroundColor: '#a5f3fc' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary mb-2">Leading Emoji</label>
                            <div className="relative">
                                <button
                                    onClick={() => setMarqueeEmoji(marqueeEmoji)}
                                    className="w-full px-4 py-3 rounded-xl border border-border-primary bg-input text-2xl text-left focus:outline-none focus:border-accent-primary/50"
                                >
                                    {marqueeEmoji}
                                </button>
                                <div className="absolute bottom-full left-0 mb-2 w-80 max-h-48 overflow-y-auto bg-card border border-border-primary rounded-xl shadow-xl p-3 hidden group-hover:block z-10">
                                    <div className="grid grid-cols-6 gap-1">
                                        {emojis.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setMarqueeEmoji(emoji)}
                                                className={`w-8 h-8 rounded-lg transition-all text-xl ${marqueeEmoji === emoji ? 'bg-accent-primary/20 ring-2 ring-accent-primary' : 'hover:bg-theme-secondary'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border-primary">
                                        <span className="text-[10px] font-black text-icon-tertiary uppercase tracking-widest mr-1">Quick:</span>
                                        <button type="button" onClick={() => setMarqueeEmoji('🏝️')} className={`w-8 h-8 rounded-lg transition-all ${marqueeEmoji === '🏝️' ? 'bg-accent-primary/15 ring-2 ring-accent-primary' : 'hover:bg-theme-secondary'}`}>🏝️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handlePostMarquee(newMarquee)}
                            disabled={!newMarquee}
                            className="w-full sm:w-auto px-6 py-3 bg-accent-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-accent-primary/20 hover:bg-accent-secondary hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 whitespace-nowrap"
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
                            className="w-full sm:w-auto px-6 py-3 bg-theme-tertiary text-icon-secondary font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-theme-secondary transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            Save Template
                        </button>
                    </div>
                </div>

                <div className="bg-theme-inverse p-8 rounded-[2.5rem] text-theme-inverse shadow-2xl overflow-y-auto max-h-[500px]">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <EmojiIcon emoji="✨" size={16} className="text-warning-primary" /> Templates
                    </h3>
                    <div className="space-y-4">
                        {templates.map(tmp => (
                            <div key={tmp.template_id} className="relative group">
                                <button
                                    onClick={() => {
                                        setNewMarquee(tmp.content);
                                        setPriority(tmp.priority);
                                    }}
                                    className="w-full p-4 bg-surface-elevated/5 border border-theme-primary/10 rounded-2xl hover:bg-surface-elevated/10 transition-all text-left group"
                                >
                                    <div className="text-xs font-black text-warning-primary uppercase tracking-widest mb-1 group-hover:text-warning-secondary">{tmp.name}</div>
                                    <div className="text-sm text-icon-tertiary line-clamp-2 font-medium">{tmp.content}</div>
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
                                        className="p-1.5 bg-accent-primary/20 text-accent-primary rounded-lg scale-75 hover:scale-90 transition-all"
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
                                        className="p-1.5 bg-danger-primary/20 text-danger-primary rounded-lg scale-75 hover:scale-90 transition-all"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Broadcast History */}
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-black text-theme-primary tracking-tight">Broadcast History</h3>
                    <p className="text-sm font-medium text-icon-tertiary">Manage active and past announcements</p>
                </div>
            </div>

            <div className="bg-card rounded-[2.5rem] border border-theme-primary shadow-xl shadow-theme overflow-hidden">
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
    );
}
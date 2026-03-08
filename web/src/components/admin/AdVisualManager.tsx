import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/urlUtils';
import { Grid, Layout, ChevronRight, Monitor, Smartphone, Save, Image as ImageIcon, Trash2, Palette, Plus, Settings, Type } from 'lucide-react';

interface ListItem {
    icon: string;
    title: string;
    desc: string;
}

interface SiteSection {
    id?: number;
    store_id?: number;
    name: string;
    section_type: string;
    title: string;
    body: string;
    cta_text: string;
    cta_link: string;
    image_url: string;
    list_items: ListItem[];
    style_config: Record<string, any>;
    is_active: boolean;
}

interface AdSpace {
    space_id: number;
    name: string;
    display_name: string;
    location: string;
    position: string;
    style_config: Record<string, any>;
}

const BANNER_PRESETS = [
    { id: 'island_orange', name: 'Island', icon: '🏝️', from: '#f97316', to: '#ea580c', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#ea580c' },
    { id: 'sunset', name: 'Sunset', icon: '🌅', from: '#f97316', to: '#db2777', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#db2777' },
    { id: 'ocean', name: 'Ocean', icon: '🌊', from: '#0ea5e9', to: '#1e40af', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#0ea5e9' },
    { id: 'forest', name: 'Forest', icon: '🌿', from: '#22c55e', to: '#14532d', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#22c55e' },
    { id: 'midnight', name: 'Midnight', icon: '🌙', from: '#1e293b', to: '#0f172a', text: '#ffffff', buttonBg: '#f59e0b', buttonText: '#0f172a' },
    { id: 'royal', name: 'Royal', icon: '👑', from: '#7c3aed', to: '#4338ca', text: '#ffffff', buttonBg: '#fbbf24', buttonText: '#4338ca' },
    { id: 'neon_pulse', name: 'Neon', icon: '⚡', from: '#f472b6', to: '#9333ea', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#9333ea' },
    { id: 'cyber', name: 'Cyber', icon: '🌃', from: '#020617', to: '#1e1b4b', text: '#38bdf8', buttonBg: '#38bdf8', buttonText: '#020617' },
    { id: 'frost', name: 'Frost', icon: '❄️', from: '#f0f9ff', to: '#7dd3fc', text: '#0369a1', buttonBg: '#0369a1', buttonText: '#ffffff' },
    { id: 'emerald', name: 'Emerald', icon: '💚', from: '#064e3b', to: '#065f46', text: '#34d399', buttonBg: '#34d399', buttonText: '#064e3b' },
    { id: 'gold_rush', name: 'Rush', icon: '💰', from: '#fbbf24', to: '#92400e', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#92400e' },
    { id: 'cosmos', name: 'Cosmos', icon: '🌌', from: '#0f172a', to: '#000000', text: '#94a3b8', buttonBg: '#38bdf8', buttonText: '#0f172a' },
    { id: 'volcano', name: 'Lava', icon: '🌋', from: '#7f1d1d', to: '#f97316', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#7f1d1d' },
    { id: 'electric', name: 'Pulse', icon: '⚡', from: '#1e40af', to: '#60a5fa', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#1e40af' },
    { id: 'spring', name: 'Bloom', icon: '🌸', from: '#16a34a', to: '#fde047', text: '#064e3b', buttonBg: '#064e3b', buttonText: '#ffffff' },
    { id: 'velvet', name: 'Night', icon: '🍷', from: '#4c0519', to: '#881337', text: '#fce7f3', buttonBg: '#fce7f3', buttonText: '#4c0519' },
    { id: 'platinum', name: 'Plat', icon: '💿', from: '#94a3b8', to: '#475569', text: '#f8fafc', buttonBg: '#f8fafc', buttonText: '#475569' },
    { id: 'ruby', name: 'Ruby', icon: '🎒', from: '#9f1239', to: '#4c0519', text: '#ffe4e6', buttonBg: '#ffe4e6', buttonText: '#9f1239' },
    { id: 'sapphire', name: 'Saph', icon: '💎', from: '#1e40af', to: '#1e3a8a', text: '#dbeafe', buttonBg: '#dbeafe', buttonText: '#1e40af' },
    { id: 'onyx', name: 'Onyx', icon: '🖤', from: '#09090b', to: '#18181b', text: '#a1a1aa', buttonBg: '#27272a', buttonText: '#ffffff' },
];

const TEXTURE_STYLES: Record<string, string> = {
    none: 'none',
    halftone: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
    stripes: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
    grid: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
    dots: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)',
    waves: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)',
    noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
    shimmer: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
    confetti: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 60% 20%, rgba(255,255,255,0.1) 2px, transparent 2px)',
    zigzag: 'linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.05) 25%, transparent 25%)',
};

// Helper function to convert hex color to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }
    return { r: 255, g: 255, b: 255 };
}

// Generate texture style properties
function getTextureStyle(texture: string, opacity: number = 0.3, scale: number = 1, color: string = '#ffffff') {
    if (texture === 'none' || !texture) return {};

    const baseStyle = TEXTURE_STYLES[texture];
    if (!baseStyle) return {};

    if (texture === 'noise') return { backgroundImage: baseStyle, opacity };

    const { r, g, b } = hexToRgb(color);
    const configuredStyle = baseStyle.replace(/rgba\(255,255,255,/g, `rgba(${r},${g},${b},`);

    return {
        backgroundImage: configuredStyle,
        backgroundSize: `${scale * 100}%`,
        opacity
    };
}

export default function AdVisualManager() {
    const [spaces, setSpaces] = useState<AdSpace[]>([]);
    const [selectedSpace, setSelectedSpace] = useState<AdSpace | null>(null);
    const [sections, setSections] = useState<SiteSection[]>([]);
    const [selectedSection, setSelectedSection] = useState<SiteSection | null>(null);
    const [stores, setStores] = useState<{ id: number; business_name: string }[]>([]);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'spaces' | 'sections'>('spaces');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [spacesRes, sectionsRes, storesRes] = await Promise.all([
                api.get('/advertisements/spaces'),
                api.get('/homepage?type=homepage'),
                api.get('/api/stores')
            ]);
            setSpaces(spacesRes.data);
            setSections(sectionsRes.data);
            setStores(storesRes.data.stores || storesRes.data || []);
        } catch (e) {
            toast.error('Failed to load visual management data');
        } finally {
            setLoading(false);
        }
    };

    const updateSpaceStyle = (updates: any) => {
        if (!selectedSpace) return;

        // If switching to color mode, clear asset url
        if (updates.bgMode === 'color') {
            updates.bgAssetUrl = null;
        }

        const newSpace = {
            ...selectedSpace,
            style_config: { ...selectedSpace.style_config, ...updates }
        };
        setSelectedSpace(newSpace);
        setSpaces(prev => prev.map(s => s.space_id === selectedSpace.space_id ? newSpace : s));
    };

    const handleSaveSpace = async () => {
        if (!selectedSpace) return;
        try {
            await api.patch(`/advertisements/admin/spaces/${selectedSpace.space_id}`, {
                style_config: selectedSpace.style_config
            });
            toast.success('Ad space styles updated');
            fetchData();
        } catch (e) {
            toast.error('Failed to save styles');
        }
    };

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedSpace) return;

        const formData = new FormData();
        formData.append('image', file);

        const loadToast = toast.loading('Uploading asset...');
        try {
            const res = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fileUrl = res.data.url;
            const isVideo = file.type.startsWith('video');

            updateSpaceStyle({
                bgAssetUrl: fileUrl,
                bgAssetType: isVideo ? 'video' : 'image',
                bgMode: 'asset',
                bgAssetFit: 'cover' // Default to crop/cover
            });

            toast.success('Background asset uploaded', { id: loadToast });
        } catch (error) {
            toast.error('Upload failed', { id: loadToast });
        }
    };

    const saveBackgroundPreset = (slot: number) => {
        if (!selectedSpace || !selectedSpace.style_config.bgAssetUrl) return;
        const currentPresets = selectedSpace.style_config.bgPresets || [];
        const newPresets = [...currentPresets];
        newPresets[slot] = {
            url: selectedSpace.style_config.bgAssetUrl,
            type: selectedSpace.style_config.bgAssetType || 'image'
        };
        updateSpaceStyle({ bgPresets: newPresets });
        toast.success(`Preset saved to slot ${slot + 1}`);
    };

    const removeBackgroundPreset = (slot: number) => {
        if (!selectedSpace) return;
        const currentPresets = selectedSpace.style_config.bgPresets || [];
        const newPresets = [...currentPresets];
        newPresets.splice(slot, 1);
        updateSpaceStyle({ bgPresets: newPresets });
        toast.success(`Preset removed from slot ${slot + 1}`);
    };

    const handleSaveSection = async () => {
        if (!selectedSection) return;
        try {
            await api.post('/api/homepage', selectedSection);
            toast.success('Site section saved');
            fetchData();
        } catch (e) {
            toast.error('Failed to save section');
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await api.delete(`/api/homepage/${id}`);
            toast.success('Section deleted');
            if (selectedSection?.id === id) setSelectedSection(null);
            fetchData();
        } catch (e) {
            toast.error('Failed to delete section');
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-[0.3em]">Initializing Creative Engine...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50">
                    <div className="flex p-1 bg-slate-50 border-b border-slate-100">
                        <button
                            onClick={() => { setActiveTab('spaces'); setSelectedSection(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'spaces' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            <Grid size={14} /> Ad Banners
                        </button>
                        <button
                            onClick={() => { setActiveTab('sections'); setSelectedSpace(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sections' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            <Layout size={14} /> Site Sections
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {activeTab === 'spaces' ? (
                            <div className="space-y-3">
                                {spaces.map(space => (
                                    <button
                                        key={space.space_id}
                                        onClick={() => setSelectedSpace(space)}
                                        className={`w-full p-5 rounded-3xl border text-left transition-all flex items-center justify-between group ${selectedSpace?.space_id === space.space_id ? 'border-teal-500 bg-teal-50/20' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-teal-600 mb-1">{space.location}</div>
                                            <div className="font-bold text-slate-900 text-sm">{space.display_name}</div>
                                        </div>
                                        <ChevronRight size={16} className={selectedSpace?.space_id === space.space_id ? 'text-teal-500' : 'text-slate-300'} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sections.map(section => (
                                    <div
                                        key={section.id}
                                        onClick={() => setSelectedSection(section)}
                                        className={`w-full p-5 rounded-3xl border text-left transition-all flex items-center justify-between group cursor-pointer ${selectedSection?.id === section.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${section.section_type === 'homepage' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    {section.section_type === 'homepage' ? 'Homepage' : 'Store'}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">/{section.name}</span>
                                            </div>
                                            <div className="font-bold text-slate-900 text-sm truncate">{section.title}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id!); }}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <ChevronRight size={16} className={selectedSection?.id === section.id ? 'text-indigo-500' : 'text-slate-300'} />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setSelectedSection({
                                        name: 'new_section',
                                        section_type: 'homepage',
                                        title: 'New Content Block',
                                        body: '',
                                        cta_text: 'Discover',
                                        cta_link: '#',
                                        image_url: '',
                                        list_items: [],
                                        style_config: {},
                                        is_active: true
                                    })}
                                    className="w-full p-5 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:border-slate-300 hover:text-slate-500 transition-all bg-slate-50/50"
                                >
                                    <Plus size={18} /> New Section
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Panel */}
                {(selectedSpace || selectedSection) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Palette size={18} className="text-teal-500" />
                                {selectedSpace ? 'Banner Presets' : 'Section Settings'}
                            </h3>
                            <button
                                onClick={() => selectedSpace ? setSelectedSpace(null) : setSelectedSection(null)}
                                className="text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {selectedSpace && (
                            <div className="space-y-8">
                                {/* Banner Template Presets */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {BANNER_PRESETS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                updateSpaceStyle({
                                                    preset: p.id,
                                                    from: p.from,
                                                    to: p.to,
                                                    textColor: p.text,
                                                    buttonBg: p.buttonBg,
                                                    buttonText: p.buttonText,
                                                    bgMode: 'color',
                                                    bgAssetUrl: null
                                                });
                                            }}
                                            className={`p-2 sm:p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedSpace.style_config?.preset === p.id ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full mb-1"
                                                style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                                            />
                                            <span className="text-[8px] font-black uppercase">{p.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content & Typography</h4>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={selectedSpace.style_config?.defaultTitle || ''}
                                            onChange={(e) => updateSpaceStyle({ defaultTitle: e.target.value })}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold"
                                            placeholder="Banner Title"
                                        />
                                        <textarea
                                            rows={2}
                                            value={selectedSpace.style_config?.defaultBody || ''}
                                            onChange={(e) => updateSpaceStyle({ defaultBody: e.target.value })}
                                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium"
                                            placeholder="Banner Subtitle"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <input
                                                type="color"
                                                value={selectedSpace.style_config?.textColor || '#ffffff'}
                                                onChange={(e) => updateSpaceStyle({ textColor: e.target.value })}
                                                className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                            />
                                            <span className="text-[8px] font-mono text-slate-400 uppercase">{selectedSpace.style_config?.textColor || '#FFFFFF'}</span>
                                        </div>
                                        <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                                            {['font-sans', 'font-serif', 'font-mono'].map(font => (
                                                <button
                                                    key={font}
                                                    onClick={() => updateSpaceStyle({ fontPrimary: font })}
                                                    className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase ${selectedSpace.style_config?.fontPrimary === font ? 'bg-white text-teal-600' : 'text-slate-400'}`}
                                                >
                                                    {font.split('-')[1]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Background mode</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button onClick={() => updateSpaceStyle({ bgMode: 'color' })} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase ${selectedSpace.style_config?.bgMode !== 'asset' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>Color</button>
                                            <button onClick={() => updateSpaceStyle({ bgMode: 'asset' })} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase ${selectedSpace.style_config?.bgMode === 'asset' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}>Asset</button>
                                        </div>
                                    </div>

                                    {selectedSpace.style_config?.bgMode === 'asset' ? (
                                        <div className="space-y-4">
                                            <div className="relative group overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-24 flex flex-col items-center justify-center gap-1 hover:border-teal-500 transition-all cursor-pointer">
                                                <ImageIcon size={20} className="text-slate-300" />
                                                <span className="text-[9px] font-black uppercase text-slate-400">Upload Content</span>
                                                <input type="file" onChange={handleBackgroundUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">Fit Mode</label>
                                                    <select
                                                        value={selectedSpace.style_config?.bgAssetFit || 'cover'}
                                                        onChange={(e) => updateSpaceStyle({ bgAssetFit: e.target.value })}
                                                        className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold"
                                                    >
                                                        <option value="cover">Crop (Cover)</option>
                                                        <option value="contain">Contain</option>
                                                        <option value="fill">Stretch (Fill)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">Position</label>
                                                    <select
                                                        value={selectedSpace.style_config?.bgAssetPosition || 'center'}
                                                        onChange={(e) => updateSpaceStyle({ bgAssetPosition: e.target.value })}
                                                        className="w-full p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold"
                                                    >
                                                        <option value="center">Center</option>
                                                        <option value="top">Top</option>
                                                        <option value="bottom">Bottom</option>
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={selectedSpace.style_config?.bgAssetUrl || ''}
                                                onChange={(e) => updateSpaceStyle({ bgAssetUrl: e.target.value })}
                                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold"
                                                placeholder="Or paste direct URL..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="color" value={selectedSpace.style_config?.from || '#ffffff'} onChange={(e) => updateSpaceStyle({ from: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
                                            <input type="color" value={selectedSpace.style_config?.to || '#000000'} onChange={(e) => updateSpaceStyle({ to: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                                            <span>BG Opacity</span>
                                            <span>{Math.round((selectedSpace.style_config?.bgOpacity ?? 1) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={selectedSpace.style_config?.bgOpacity ?? 1}
                                            onChange={e => updateSpaceStyle({ bgOpacity: parseFloat(e.target.value) })}
                                            className="w-full accent-teal-600"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Texture Effect</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(TEXTURE_STYLES).map(texture => (
                                            <button
                                                key={texture}
                                                onClick={() => updateSpaceStyle({ texture, textureOpacity: selectedSpace.style_config?.textureOpacity || 0.3 })}
                                                className={`p-2 rounded-lg border text-[10px] ${selectedSpace.style_config?.texture === texture ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                            >
                                                {texture === 'none' ? '🚫' : texture[0].toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedSpace.style_config?.texture && selectedSpace.style_config.texture !== 'none' && (
                                        <div className="space-y-4 pt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">Pattern Color</label>
                                                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                                        <input
                                                            type="color"
                                                            value={selectedSpace.style_config?.textureColor || '#ffffff'}
                                                            onChange={(e) => updateSpaceStyle({ textureColor: e.target.value })}
                                                            className="w-6 h-6 rounded-md cursor-pointer border-none"
                                                        />
                                                        <span className="text-[9px] font-mono text-slate-400 uppercase">{selectedSpace.style_config?.textureColor || '#FFFFFF'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-slate-400">Scale: {Math.round((selectedSpace.style_config?.textureScale || 1) * 100)}%</label>
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="3"
                                                        step="0.1"
                                                        value={selectedSpace.style_config?.textureScale || 1}
                                                        onChange={e => updateSpaceStyle({ textureScale: parseFloat(e.target.value) })}
                                                        className="w-full accent-teal-600 h-8"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                                                    <span>Pattern Opacity</span>
                                                    <span>{Math.round((selectedSpace.style_config.textureOpacity || 0.3) * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={selectedSpace.style_config.textureOpacity || 0.3}
                                                    onChange={e => updateSpaceStyle({ textureOpacity: parseFloat(e.target.value) })}
                                                    className="w-full accent-teal-600"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSaveSpace}
                                    className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-500 shadow-xl shadow-teal-900/10 transition-all flex items-center justify-center gap-3"
                                >
                                    <Save size={16} /> Save Banner Config
                                </button>
                            </div>
                        )}

                        {selectedSection && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Content</label>
                                    <input type="text" value={selectedSection.title} onChange={e => setSelectedSection({ ...selectedSection, title: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black italic uppercase tracking-tighter" placeholder="Section Title" />
                                    <textarea rows={4} value={selectedSection.body} onChange={e => setSelectedSection({ ...selectedSection, body: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium" placeholder="Section Body" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" value={selectedSection.cta_text} onChange={e => setSelectedSection({ ...selectedSection, cta_text: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest" placeholder="Button Label" />
                                    <input type="text" value={selectedSection.cta_link} onChange={e => setSelectedSection({ ...selectedSection, cta_link: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium" placeholder="Link URL" />
                                </div>
                                <button
                                    onClick={handleSaveSection}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-900/10 transition-all flex items-center justify-center gap-3"
                                >
                                    <Save size={16} /> Deploy Site Section
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="flex items-center justify-between px-6 bg-white p-4 rounded-4xl border border-slate-100">
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                        <button onClick={() => setViewMode('desktop')} className={`p-3 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><Monitor size={20} /></button>
                        <button onClick={() => setViewMode('mobile')} className={`p-3 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}><Smartphone size={20} /></button>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Creative Sandbox Preview</div>
                </div>

                <div className={`flex-1 bg-slate-50 rounded-[4rem] border-8 border-white shadow-inner overflow-y-auto custom-scrollbar relative min-h-[700px] flex flex-col items-center ${viewMode === 'mobile' ? 'max-w-[420px] mx-auto p-0 pt-12 pb-24' : 'p-12 w-full'} transition-all duration-700`}>
                    {activeTab === 'spaces' ? (
                        <div className={`w-full ${selectedSpace ? 'max-w-2xl' : 'max-w-5xl'} space-y-12`}>
                            {!selectedSpace ? (
                                <div className="space-y-10 w-full">
                                    <div className="text-center">
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{spaces.length} Active Ad Spaces</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {spaces.map(space => (
                                            <button key={space.space_id} onClick={() => setSelectedSpace(space)} className="text-left p-6 rounded-3xl border border-slate-100 bg-white/50 hover:border-slate-200 transition-all group">
                                                <div className="text-[9px] font-black uppercase text-slate-400 group-hover:text-teal-600">{space.location}</div>
                                                <div className="mt-2 font-bold text-slate-900">{space.display_name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <button onClick={() => setSelectedSpace(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-teal-600 transition-colors">
                                        <ChevronRight size={16} className="rotate-180" /> Back to Overview
                                    </button>
                                    <div className="w-full overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl relative">
                                        <div
                                            className="p-10 min-h-[400px] flex flex-col justify-center relative overflow-hidden"
                                            style={{
                                                backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                                                backgroundSize: '20px 20px',
                                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            {/* Background Layer */}
                                            <div
                                                className="absolute inset-0 z-0"
                                                style={{
                                                    background: selectedSpace.style_config?.bgMode === 'asset' && selectedSpace.style_config?.bgAssetUrl
                                                        ? `url(${getImageUrl(selectedSpace.style_config.bgAssetUrl)}) ${selectedSpace.style_config.bgAssetPosition || 'center'}/${selectedSpace.style_config.bgAssetFit || 'cover'} no-repeat`
                                                        : `linear-gradient(135deg, ${selectedSpace.style_config?.from || '#14b8a6'}, ${selectedSpace.style_config?.to || '#0d9488'})`,
                                                    opacity: selectedSpace.style_config?.bgOpacity ?? 1
                                                }}
                                            />
                                            {/* Texture Overlay */}
                                            <div
                                                className="absolute inset-0 z-10"
                                                style={getTextureStyle(
                                                    selectedSpace.style_config?.texture || 'none',
                                                    selectedSpace.style_config?.textureOpacity || 0.3,
                                                    selectedSpace.style_config?.textureScale || 1,
                                                    selectedSpace.style_config?.textureColor || '#ffffff'
                                                )}
                                            />
                                            <div className="relative z-20 space-y-4 max-w-xl">
                                                <h2
                                                    className={`${selectedSpace.style_config?.fontPrimary || 'font-sans'} font-black leading-[0.9]`}
                                                    style={{
                                                        fontSize: '48px',
                                                        color: selectedSpace.style_config?.textColor || '#ffffff',
                                                        textTransform: selectedSpace.style_config?.titleUppercase !== false ? 'uppercase' : 'none',
                                                        fontStyle: selectedSpace.style_config?.titleItalic ? 'italic' : 'normal'
                                                    }}
                                                >
                                                    {selectedSpace.style_config?.defaultTitle || 'Impactful Headlines'}
                                                </h2>
                                                <p className="text-lg font-medium" style={{ color: selectedSpace.style_config?.textColor || '#ffffff', opacity: 0.9 }}>
                                                    {selectedSpace.style_config?.defaultBody || 'Craft your message with precision for your audience.'}
                                                </p>
                                                <div className="pt-4">
                                                    <button
                                                        className="px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
                                                        style={{
                                                            backgroundColor: selectedSpace.style_config?.buttonBg || '#ffffff',
                                                            color: selectedSpace.style_config?.buttonText || '#0d9488'
                                                        }}
                                                    >
                                                        {selectedSpace.style_config?.buttonTextLabel || 'Shop Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full max-w-5xl">
                            {!selectedSection ? (
                                <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
                                    <h4 className="text-2xl font-black text-slate-900 uppercase">Section Preview Mode</h4>
                                </div>
                            ) : (
                                <div className="relative w-full rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl bg-white min-h-[500px] flex items-center p-12 lg:p-20">
                                    <div className="relative z-10 max-w-2xl">
                                        <h2 className="text-6xl font-black mb-6 leading-tight uppercase italic">{selectedSection.title}</h2>
                                        <p className="text-lg text-slate-600 mb-10 leading-relaxed">{selectedSection.body}</p>
                                        <button className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest">
                                            {selectedSection.cta_text}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
    { id: 'sunset', name: 'Sunset', icon: '🌅', from: '#f97316', to: '#db2777', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#db2777' },
    { id: 'ocean', name: 'Ocean', icon: '🌊', from: '#0ea5e9', to: '#1e40af', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#0ea5e9' },
    { id: 'forest', name: 'Forest', icon: '🌿', from: '#22c55e', to: '#14532d', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#22c55e' },
    { id: 'midnight', name: 'Midnight', icon: '🌙', from: '#1e293b', to: '#0f172a', text: '#ffffff', buttonBg: '#f59e0b', buttonText: '#0f172a' },
    { id: 'royal', name: 'Royal', icon: '👑', from: '#7c3aed', to: '#4338ca', text: '#ffffff', buttonBg: '#fbbf24', buttonText: '#4338ca' },
    { id: 'peach', name: 'Peach', icon: '🍑', from: '#fdba74', to: '#f43f5e', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#f43f5e' },
];

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

// Generate texture style with custom color
function getTextureStyle(texture: string, color: string = '#ffffff'): string {
    if (texture === 'none' || !texture) return 'none';

    const baseStyle = TEXTURE_STYLES[texture];
    if (!baseStyle) return 'none';

    // For noise (SVG data URI), return as-is since it doesn't use rgba
    if (texture === 'noise') return baseStyle;

    // Parse hex color to RGB values
    const { r, g, b } = hexToRgb(color);

    // Replace rgba(255,255,255,X) with rgba(r,g,b,X)
    return baseStyle.replace(/rgba\(255,255,255,/g, `rgba(${r},${g},${b},`);
}

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

    const updateSpaceStyle = (updates: Partial<AdSpace['style_config']>) => {
        if (!selectedSpace) return;
        setSelectedSpace({
            ...selectedSpace,
            style_config: { ...selectedSpace.style_config, ...updates }
        });
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
        formData.append('image', file); // uploadAsset expects 'image' field for anything

        const loadToast = toast.loading('Uploading asset...');
        try {
            const res = await api.post('/api/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const fileUrl = res.data.url;
            const isVideo = file.type.startsWith('video');

            updateSpaceStyle({
                bgAssetUrl: fileUrl,
                bgAssetType: isVideo ? 'video' : 'image',
                bgMode: 'asset'
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
                                            {section.store_id && (
                                                <div className="text-[9px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                                                    <Settings size={10} /> {stores.find(s => s.id === section.store_id)?.business_name || 'Vendor Section'}
                                                </div>
                                            )}
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
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {BANNER_PRESETS.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedSpace({
                                                    ...selectedSpace!,
                                                    style_config: {
                                                        ...selectedSpace!.style_config,
                                                        preset: p.id,
                                                        from: p.from,
                                                        to: p.to,
                                                        textColor: p.text,
                                                        buttonBg: p.buttonBg,
                                                        buttonText: p.buttonText,
                                                        showButton: selectedSpace!.style_config?.showButton ?? true,
                                                        buttonTextLabel: selectedSpace!.style_config?.buttonTextLabel || 'Shop Now',
                                                        targetLink: selectedSpace!.style_config?.targetLink || '#'
                                                    }
                                                });
                                            }}
                                            className={`p-2 sm:p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedSpace.style_config?.preset === p.id ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full mb-1"
                                                style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                                            />
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">{p.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Space Identification & Default Text */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Space Content</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Default Title</label>
                                            <input
                                                type="text"
                                                value={selectedSpace.style_config?.defaultTitle || ''}
                                                onChange={(e) => updateSpaceStyle({ defaultTitle: e.target.value })}
                                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold"
                                                placeholder="e.g. Partner Spotlight"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Default Body</label>
                                            <textarea
                                                rows={2}
                                                value={selectedSpace.style_config?.defaultBody || ''}
                                                onChange={(e) => updateSpaceStyle({ defaultBody: e.target.value })}
                                                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium"
                                                placeholder="e.g. Exclusive offers from our community"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Core Identity (Icon & Typography) */}
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Icon Picker */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Hero Icon</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['✨', '🔥', '🌴', '🍴', '🎁', '⚡', '📍', '⭐'].map((icon) => (
                                                    <button
                                                        key={icon}
                                                        onClick={() => updateSpaceStyle({ icon })}
                                                        className={`p-2.5 rounded-xl border transition-all text-lg ${selectedSpace.style_config?.icon === icon ? 'bg-teal-600 border-teal-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Typography Controls */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Typography Style</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => updateSpaceStyle({ titleItalic: !selectedSpace.style_config?.titleItalic })}
                                                    className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedSpace.style_config?.titleItalic ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-100'}`}
                                                >
                                                    <i>Italic</i>
                                                </button>
                                                <button
                                                    onClick={() => updateSpaceStyle({ titleUppercase: !selectedSpace.style_config?.titleUppercase !== false })}
                                                    className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedSpace.style_config?.titleUppercase !== false ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-100'}`}
                                                >
                                                    UPPERCASE
                                                </button>
                                            </div>
                                            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                                                {['font-sans', 'font-serif', 'font-mono'].map(font => (
                                                    <button
                                                        key={font}
                                                        onClick={() => updateSpaceStyle({ fontPrimary: font })}
                                                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${selectedSpace.style_config?.fontPrimary === font ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400'}`}
                                                    >
                                                        {font.split('-')[1]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Size & Spacing Sliders */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                <span>Title Size</span>
                                                <span>{selectedSpace.style_config?.titleSize || 24}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="12"
                                                max="64"
                                                value={selectedSpace.style_config?.titleSize || 24}
                                                onChange={(e) => updateSpaceStyle({ titleSize: parseInt(e.target.value) })}
                                                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                <span>Letter Spacing</span>
                                                <span>{selectedSpace.style_config?.letterSpacing || 0}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-2"
                                                max="10"
                                                step="0.5"
                                                value={selectedSpace.style_config?.letterSpacing || 0}
                                                onChange={(e) => updateSpaceStyle({ letterSpacing: parseFloat(e.target.value) })}
                                                className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button Configuration */}
                                <div className="pt-6 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                                                <Type size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">CTA Button</span>
                                                <span className="text-[9px] text-slate-400">Enable interaction button</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateSpaceStyle({ showButton: !selectedSpace.style_config?.showButton })}
                                            className={`relative w-14 h-7 rounded-full transition-all ${selectedSpace.style_config?.showButton ? 'bg-teal-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${selectedSpace.style_config?.showButton ? 'left-8' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {selectedSpace.style_config?.showButton && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Label</label>
                                                    <input
                                                        type="text"
                                                        value={selectedSpace.style_config?.buttonTextLabel || 'Shop Now'}
                                                        onChange={(e) => updateSpaceStyle({ buttonTextLabel: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest"
                                                        placeholder="Shop Now"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Link</label>
                                                    <input
                                                        type="text"
                                                        value={selectedSpace.style_config?.targetLink || '#'}
                                                        onChange={(e) => updateSpaceStyle({ targetLink: e.target.value })}
                                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold"
                                                        placeholder="/stores/..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <input
                                                        type="color"
                                                        value={selectedSpace.style_config?.buttonBg || '#ffffff'}
                                                        onChange={(e) => updateSpaceStyle({ buttonBg: e.target.value })}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-[9px] font-bold text-slate-700 block">Bg</span>
                                                        <span className="text-[8px] font-mono text-slate-400 uppercase">{selectedSpace.style_config?.buttonBg || '#FFFFFF'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <input
                                                        type="color"
                                                        value={selectedSpace.style_config?.buttonText || '#0d9488'}
                                                        onChange={(e) => updateSpaceStyle({ buttonText: e.target.value })}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-[9px] font-bold text-slate-700 block">Text</span>
                                                        <span className="text-[8px] font-mono text-slate-400 uppercase">{selectedSpace.style_config?.buttonText || '#0D9488'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Visual Effects (Textures & Colors) */}
                                <div className="pt-6 border-t border-slate-100 space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Texture Overlay</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {Object.keys(TEXTURE_STYLES).map((texture) => (
                                                <button
                                                    key={texture}
                                                    onClick={() => updateSpaceStyle({ texture, textureOpacity: selectedSpace.style_config?.textureOpacity || 0.3 })}
                                                    className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${selectedSpace.style_config?.texture === texture ? 'bg-teal-600 border-teal-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    <div className="w-6 h-6 rounded flex items-center justify-center text-sm">
                                                        {texture === 'none' && '🚫'}
                                                        {texture === 'halftone' && '◉'}
                                                        {texture === 'stripes' && '║'}
                                                        {texture === 'grid' && '⊞'}
                                                        {texture === 'dots' && '⠋'}
                                                        {texture === 'waves' && '≋'}
                                                        {texture === 'noise' && '▒'}
                                                        {texture === 'shimmer' && '✨'}
                                                        {texture === 'confetti' && '🎊'}
                                                        {texture === 'zigzag' && '⌘'}
                                                    </div>
                                                    <span className="text-[7px] capitalize">{texture}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {selectedSpace.style_config?.texture && selectedSpace.style_config.texture !== 'none' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                        <span>Opacity</span>
                                                        <span>{Math.round((selectedSpace.style_config?.textureOpacity || 0.3) * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.05"
                                                        value={selectedSpace.style_config?.textureOpacity || 0.3}
                                                        onChange={(e) => updateSpaceStyle({ textureOpacity: parseFloat(e.target.value) })}
                                                        className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <input
                                                        type="color"
                                                        value={selectedSpace.style_config?.textureColor || '#ffffff'}
                                                        onChange={(e) => updateSpaceStyle({ textureColor: e.target.value })}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-[9px] font-bold text-slate-700 block">Texture Color</span>
                                                        <span className="text-[8px] font-mono text-slate-400 uppercase">{selectedSpace.style_config?.textureColor || '#FFFFFF'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Background Mode Toggle */}
                                    <div className="pt-6 border-t border-slate-100 space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">Background Mode</span>
                                                <span className="text-[9px] text-slate-400">Choose between gradient or assets</span>
                                            </div>
                                            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                                                <button
                                                    onClick={() => updateSpaceStyle({ bgMode: 'gradient' })}
                                                    className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${selectedSpace.style_config?.bgMode !== 'asset' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400'}`}
                                                >
                                                    Gradient
                                                </button>
                                                <button
                                                    onClick={() => updateSpaceStyle({ bgMode: 'asset' })}
                                                    className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${selectedSpace.style_config?.bgMode === 'asset' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400'}`}
                                                >
                                                    Asset
                                                </button>
                                            </div>
                                        </div>

                                        {selectedSpace.style_config?.bgMode === 'asset' ? (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                                {/* Asset Upload */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Upload Background (Image/Video)</label>
                                                    <div className="relative group overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-32 flex flex-col items-center justify-center gap-2 hover:border-teal-500 transition-all cursor-pointer">
                                                        {selectedSpace.style_config.bgAssetUrl ? (
                                                            <>
                                                                <div className="absolute inset-0 opacity-20">
                                                                    {selectedSpace.style_config.bgAssetType === 'video' ? (
                                                                        <video src={selectedSpace.style_config.bgAssetUrl} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <img src={selectedSpace.style_config.bgAssetUrl} className="w-full h-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <ImageIcon className="text-teal-600 mb-1" />
                                                                <span className="text-[9px] font-black uppercase text-teal-700 relative z-10">Replace Content</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="text-slate-400" />
                                                                <span className="text-[9px] font-black uppercase text-slate-400">Click or Drag File</span>
                                                                <span className="text-[7px] font-bold text-slate-300">Max size: 50MB</span>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            onChange={handleBackgroundUpload}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            accept="image/*,video/*"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Preset Slots */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Preset Library</label>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Up to 3 Slots</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {[0, 1, 2].map(slot => (
                                                            <div key={slot} className="relative group">
                                                                <button
                                                                    onClick={() => {
                                                                        const p = selectedSpace.style_config.bgPresets?.[slot];
                                                                        if (p) updateSpaceStyle({ bgAssetUrl: p.url, bgAssetType: p.type, bgMode: 'asset' });
                                                                    }}
                                                                    className={`w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden ${selectedSpace.style_config.bgPresets?.[slot] ? 'border-slate-100 hover:border-teal-500' : 'border-dashed border-slate-200 bg-slate-50'}`}
                                                                >
                                                                    {selectedSpace.style_config.bgPresets?.[slot] ? (
                                                                        <div className="w-full h-full relative">
                                                                            {selectedSpace.style_config.bgPresets[slot].type === 'video' ? (
                                                                                <video src={selectedSpace.style_config.bgPresets[slot].url} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <img src={selectedSpace.style_config.bgPresets[slot].url} className="w-full h-full object-cover" />
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[8px] font-black text-slate-300">Slot {slot + 1}</span>
                                                                    )}
                                                                </button>
                                                                {selectedSpace.style_config.bgAssetUrl && !selectedSpace.style_config.bgPresets?.[slot] && (
                                                                    <button
                                                                        onClick={() => saveBackgroundPreset(slot)}
                                                                        className="absolute -top-1 -right-1 bg-teal-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <Plus size={10} />
                                                                    </button>
                                                                )}
                                                                {selectedSpace.style_config.bgPresets?.[slot] && (
                                                                    <button
                                                                        onClick={() => removeBackgroundPreset(slot)}
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <Trash2 size={10} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Gradient Controls (Original) */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3 p-3 bg-slate-100/50 rounded-2xl border border-slate-100">
                                                        <input
                                                            type="color"
                                                            value={selectedSpace.style_config?.from || '#ffffff'}
                                                            onChange={(e) => updateSpaceStyle({ from: e.target.value })}
                                                            className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white shadow-sm"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-[8px] font-bold text-slate-500 block uppercase">Start</span>
                                                            <span className="text-[9px] font-mono font-black uppercase">{selectedSpace.style_config?.from || '#FFFFFF'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-slate-100/50 rounded-2xl border border-slate-100">
                                                        <input
                                                            type="color"
                                                            value={selectedSpace.style_config?.to || '#f1f5f9'}
                                                            onChange={(e) => updateSpaceStyle({ to: e.target.value })}
                                                            className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white shadow-sm"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-[8px] font-bold text-slate-500 block uppercase">End</span>
                                                            <span className="text-[9px] font-mono font-black uppercase">{selectedSpace.style_config?.to || '#F1F5F9'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveSpace}
                                    className="w-full py-5 bg-teal-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-teal-700 transition-all shadow-xl shadow-teal-900/20 active:scale-[0.98]"
                                >
                                    <Save size={18} /> Deploy Banner Config
                                </button>
                            </div>
                        )}

                        {selectedSection && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Context</label>
                                        <select
                                            value={selectedSection.section_type}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const updates: Partial<SiteSection> = { section_type: val };
                                                if (val === 'store_kitchen') updates.name = 'kitchen_story';
                                                if (val === 'exclusive_promotion') updates.name = 'exclusive_promotion';
                                                if (val === 'connect_with_us') updates.name = 'connect_with_us';
                                                setSelectedSection({ ...selectedSection, ...updates });
                                            }}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <option value="homepage">Homepage Block</option>
                                            <option value="store_kitchen">Kitchen Story (Store)</option>
                                            <option value="exclusive_promotion">ExclusivePromotion (Store)</option>
                                            <option value="connect_with_us">Connect With Us (Store)</option>
                                            <option value="other">Other/Custom</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Target Store</label>
                                        <select
                                            value={selectedSection.store_id || ''}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, store_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <option value="">Global/None</option>
                                            {stores.map(s => (
                                                <option key={s.id} value={s.id}>{s.business_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Identifier (Immutable)</label>
                                    <input
                                        type="text"
                                        value={selectedSection.name}
                                        onChange={(e) => setSelectedSection({ ...selectedSection, name: e.target.value })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono font-bold"
                                        placeholder="e.g. empowering_economies"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Main Title</label>
                                    <input
                                        type="text"
                                        value={selectedSection.title}
                                        onChange={(e) => setSelectedSection({ ...selectedSection, title: e.target.value })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-black italic uppercase tracking-tighter"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Content Body</label>
                                    <textarea
                                        rows={4}
                                        value={selectedSection.body}
                                        onChange={(e) => setSelectedSection({ ...selectedSection, body: e.target.value })}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium leading-relaxed"
                                    />
                                </div>

                                {/* Section Typography */}
                                <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Type size={16} className="text-indigo-600" />
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Heading Typography</h5>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Heading Font</label>
                                            <select
                                                value={selectedSection.style_config?.fontPrimary || 'font-sans'}
                                                onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, fontPrimary: e.target.value } })}
                                                className="w-full p-3 bg-white rounded-xl border border-slate-200 text-[10px] font-bold"
                                            >
                                                <option value="font-sans">Modern Sans</option>
                                                <option value="font-serif">Elegant Serif</option>
                                                <option value="font-mono">Technical Mono</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Font Alignment</label>
                                            <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button
                                                        key={align}
                                                        onClick={() => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, textAlign: align } })}
                                                        className={`flex-1 p-2 rounded-lg text-[10px] uppercase font-black transition-all ${selectedSection.style_config?.textAlign === align ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Heading Size ({selectedSection.style_config?.titleSize || 48}px)</label>
                                            <input
                                                type="range"
                                                min="24"
                                                max="120"
                                                value={selectedSection.style_config?.titleSize || 48}
                                                onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, titleSize: parseInt(e.target.value) } })}
                                                className="w-full accent-indigo-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Letter Spacing ({selectedSection.style_config?.letterSpacing || 0}px)</label>
                                            <input
                                                type="range"
                                                min="-4"
                                                max="20"
                                                step="0.5"
                                                value={selectedSection.style_config?.letterSpacing || 0}
                                                onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, letterSpacing: parseFloat(e.target.value) } })}
                                                className="w-full accent-indigo-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                            <input
                                                type="checkbox"
                                                checked={selectedSection.style_config?.titleItalic}
                                                onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, titleItalic: e.target.checked } })}
                                                className="accent-indigo-600 rounded"
                                            />
                                            <span className="text-[9px] font-black uppercase italic">Italic</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                            <input
                                                type="checkbox"
                                                checked={selectedSection.style_config?.titleUppercase !== false}
                                                onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, titleUppercase: e.target.checked } })}
                                                className="accent-indigo-600 rounded"
                                            />
                                            <span className="text-[9px] font-black uppercase">Caps</span>
                                        </div>
                                    </div>
                                </div>

                                {(selectedSection.section_type === 'exclusive_promotion' || selectedSection.section_type === 'homepage') && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Accent Gradient Colors</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <input
                                                    type="color"
                                                    value={selectedSection.style_config?.from || '#6366f1'}
                                                    onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, from: e.target.value } })}
                                                    className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                />
                                                <span className="text-[9px] font-mono font-bold uppercase text-slate-400">{selectedSection.style_config?.from || '#6366F1'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <input
                                                    type="color"
                                                    value={selectedSection.style_config?.to || '#4f46e5'}
                                                    onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, to: e.target.value } })}
                                                    className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                />
                                                <span className="text-[9px] font-mono font-bold uppercase text-slate-400">{selectedSection.style_config?.to || '#4F46E5'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(selectedSection.section_type === 'store_kitchen' || selectedSection.section_type === 'connect_with_us') && (
                                    <div className="pt-6 border-t border-slate-100 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Structured Features (List)</label>
                                        {(selectedSection.list_items || []).map((item, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={item.icon || ''}
                                                    onChange={(e) => {
                                                        const newList = [...selectedSection.list_items];
                                                        newList[idx].icon = e.target.value;
                                                        setSelectedSection({ ...selectedSection, list_items: newList });
                                                    }}
                                                    placeholder="🥑"
                                                    className="w-12 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <input
                                                        type="text"
                                                        value={item.title || ''}
                                                        onChange={(e) => {
                                                            const newList = [...selectedSection.list_items];
                                                            newList[idx].title = e.target.value;
                                                            setSelectedSection({ ...selectedSection, list_items: newList });
                                                        }}
                                                        placeholder="Feature Title"
                                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black uppercase"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.desc || ''}
                                                        onChange={(e) => {
                                                            const newList = [...selectedSection.list_items];
                                                            newList[idx].desc = e.target.value;
                                                            setSelectedSection({ ...selectedSection, list_items: newList });
                                                        }}
                                                        placeholder="Feature Description"
                                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 text-[9px] font-medium"
                                                    />
                                                </div>
                                                <button onClick={() => {
                                                    const newList = selectedSection.list_items.filter((_, i) => i !== idx);
                                                    setSelectedSection({ ...selectedSection, list_items: newList });
                                                }} className="text-red-400 hover:text-red-600">✕</button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setSelectedSection({ ...selectedSection, list_items: [...(selectedSection.list_items || []), { icon: '✨', title: '', desc: '' }] })}
                                            className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                                        >
                                            + Add Feature Item
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">CTA Button Label</label>
                                        <input
                                            type="text"
                                            value={selectedSection.cta_text}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, cta_text: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">CTA Link URL</label>
                                        <input
                                            type="text"
                                            value={selectedSection.cta_link}
                                            onChange={(e) => setSelectedSection({ ...selectedSection, cta_link: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                {/* CTA Button Color Controls - Mobile Optimized */}
                                {(selectedSection.section_type === 'exclusive_promotion' || selectedSection.section_type === 'homepage') && (
                                    <div className="pt-6 border-t border-slate-100 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">CTA Button Styling</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <input
                                                    type="color"
                                                    value={selectedSection.style_config?.buttonBg || '#ffffff'}
                                                    onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, buttonBg: e.target.value } })}
                                                    className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-[9px] font-bold text-slate-700 block">Background</span>
                                                    <span className="text-[8px] font-mono text-slate-400">{selectedSection.style_config?.buttonBg || '#FFFFFF'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <input
                                                    type="color"
                                                    value={selectedSection.style_config?.buttonText || '#0d9488'}
                                                    onChange={(e) => setSelectedSection({ ...selectedSection, style_config: { ...selectedSection.style_config, buttonText: e.target.value } })}
                                                    className="w-8 h-8 rounded-lg cursor-pointer border-none"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-[9px] font-bold text-slate-700 block">Text</span>
                                                    <span className="text-[8px] font-mono text-slate-400">{selectedSection.style_config?.buttonText || '#0D9488'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Color Presets - Grid Layout */}
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                            {[
                                                { bg: '#ffffff', text: '#0d9488' },
                                                { bg: '#ffffff', text: '#4f46e5' },
                                                { bg: '#ffffff', text: '#059669' },
                                                { bg: '#ffffff', text: '#ea580c' },
                                                { bg: '#1e293b', text: '#ffffff' },
                                                { bg: '#ffffff', text: '#1e293b' },
                                            ].map((preset, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedSection({
                                                        ...selectedSection,
                                                        style_config: { ...selectedSection.style_config, buttonBg: preset.bg, buttonText: preset.text }
                                                    })}
                                                    className="p-2 rounded-lg border border-slate-200 flex flex-col items-center gap-1 hover:shadow-md transition-all"
                                                >
                                                    <span
                                                        className="w-5 h-5 rounded-full border border-slate-200 shadow-sm"
                                                        style={{ background: preset.bg }}
                                                    />
                                                    <span
                                                        className="text-[7px] sm:text-[8px] font-bold uppercase"
                                                        style={{ color: preset.text }}
                                                    >
                                                        Aa
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            <Monitor size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-3 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                        >
                            <Smartphone size={20} />
                        </button>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Creative Sandbox Preview</div>
                </div>

                <div className={`flex-1 bg-slate-50 rounded-[4rem] border-8 border-white shadow-inner overflow-y-auto custom-scrollbar relative min-h-[700px] flex flex-col items-center ${viewMode === 'mobile' ? 'max-w-[420px] mx-auto p-0 pt-12 pb-24' : 'p-12 w-full'} transition-all duration-700`}>
                    {activeTab === 'spaces' ? (
                        <div className={`w-full max-w-2xl ${selectedSpace?.position === 'footer' && viewMode === 'mobile' ? 'h-full flex flex-col justify-end' : 'space-y-12'}`}>
                            {!selectedSpace ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 gap-4 italic font-medium">
                                    <ImageIcon size={64} className="opacity-20" />
                                    Select an ad space to visualize
                                </div>
                            ) : (
                                <div className={`space-y-8 ${selectedSpace.position === 'footer' && viewMode === 'mobile' ? 'w-full sticky bottom-0 z-20' : ''}`}>
                                    <div className="text-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 mb-2 block">Space: {selectedSpace.name}</span>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">{selectedSpace.display_name}</h4>
                                    </div>

                                    {/* Mock Banner - With Dynamic Preview */}
                                    <div
                                        className={`w-full overflow-hidden shadow-2xl transition-all duration-700 ${selectedSpace.style_config?.radius || 'rounded-[2.5rem]'} border-4 border-white relative`}
                                        style={{
                                            background: selectedSpace.style_config?.bgMode === 'asset' ? '#000' : `linear-gradient(135deg, ${selectedSpace.style_config?.from || '#ffffff'}, ${selectedSpace.style_config?.to || '#f1f5f9'})`,
                                            minHeight: selectedSpace.position === 'hero' ? '320px' : selectedSpace.position === 'footer' ? '120px' : '220px'
                                        }}
                                    >
                                        {/* Background Asset */}
                                        {selectedSpace.style_config?.bgMode === 'asset' && selectedSpace.style_config?.bgAssetUrl && (
                                            <div className="absolute inset-0 pointer-events-none">
                                                {selectedSpace.style_config.bgAssetType === 'video' ? (
                                                    <video
                                                        src={selectedSpace.style_config.bgAssetUrl}
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={selectedSpace.style_config.bgAssetUrl}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay for text legibility */}
                                            </div>
                                        )}
                                        {/* Texture Overlay */}
                                        {selectedSpace.style_config?.texture && selectedSpace.style_config.texture !== 'none' && (
                                            <div
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    backgroundImage: getTextureStyle(selectedSpace.style_config?.texture || '', selectedSpace.style_config?.textureColor || '#ffffff'),
                                                    opacity: selectedSpace.style_config?.textureOpacity || 0.5,
                                                    transform: selectedSpace.style_config?.texture !== 'noise' ? `scale(${selectedSpace.style_config?.textureScale || 1})` : 'none',
                                                    transformOrigin: 'center center'
                                                }}
                                            />
                                        )}

                                        <div
                                            className={`h-full w-full flex flex-col bg-black/5 backdrop-blur-[2px] relative group overflow-hidden p-6 sm:p-10`}
                                            style={{
                                                paddingTop: selectedSpace.style_config?.paddingTop || 24,
                                                paddingBottom: selectedSpace.style_config?.paddingBottom || 24,
                                                justifyContent: 'center',
                                                alignItems: selectedSpace.style_config?.textAlign === 'left' ? 'flex-start' : selectedSpace.style_config?.textAlign === 'right' ? 'flex-end' : 'center',
                                                textAlign: selectedSpace.style_config?.textAlign || 'center'
                                            }}
                                        >
                                            {/* Optional Badge */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-lg text-[7px] font-black text-white uppercase tracking-widest border border-white/20">Live Ads Here</span>
                                            </div>

                                            {/* Dynamic Text Content */}
                                            <div
                                                className={`transition-all duration-500 ${selectedSpace.style_config?.fontPrimary || 'font-sans'}`}
                                                style={{ color: selectedSpace.style_config?.textColor || '#ffffff' }}
                                            >
                                                <span className="text-xl sm:text-2xl mb-1 block transition-transform group-hover:scale-110 duration-500">
                                                    {selectedSpace.style_config?.icon || '✨'}
                                                </span>
                                                <h4
                                                    className={`leading-tight inline-block mb-1 ${selectedSpace.style_config?.titleItalic ? 'italic' : ''} ${selectedSpace.style_config?.titleUppercase !== false ? 'uppercase' : ''}`}
                                                    style={{
                                                        fontSize: `${selectedSpace.style_config?.titleSize || (selectedSpace.position === 'hero' ? 28 : 18)}px`,
                                                        fontWeight: 900,
                                                        letterSpacing: `${selectedSpace.style_config?.letterSpacing || 0}px`
                                                    }}
                                                >
                                                    {selectedSpace.style_config?.defaultTitle || selectedSpace.display_name}
                                                </h4>
                                                {selectedSpace.style_config?.defaultBody && (
                                                    <p className="text-[10px] sm:text-xs font-semibold opacity-90 max-w-md mx-auto mb-2">
                                                        {selectedSpace.style_config.defaultBody}
                                                    </p>
                                                )}
                                                <p className="opacity-70 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.3em]">
                                                    {selectedSpace.location} Spot • {selectedSpace.width}x{selectedSpace.height}
                                                </p>
                                            </div>

                                            {/* Dynamic CTA Button Preview */}
                                            {selectedSpace.style_config?.showButton !== false && (
                                                <div className="mt-4 flex flex-col items-center">
                                                    <button
                                                        className="px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[8px] sm:text-[9px] shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                                                        style={{
                                                            background: selectedSpace.style_config?.buttonBg || '#ffffff',
                                                            color: selectedSpace.style_config?.buttonText || '#0d9488'
                                                        }}
                                                    >
                                                        {selectedSpace.style_config?.buttonTextLabel || 'Explore'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedSpace.position === 'footer' && viewMode === 'mobile' && (
                                        <div className="p-4 text-center bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 mx-4 shadow-sm mb-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sticky Footer Preview Controlled by User Device</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl space-y-12 px-6">
                            {!selectedSection ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 gap-4 italic font-medium">
                                    <Layout size={64} className="opacity-20" />
                                    Select a context block to preview
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {selectedSection.section_type === 'store_kitchen' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center p-12 bg-white rounded-[4rem] shadow-2xl border border-slate-100">
                                            <div style={{ textAlign: selectedSection.style_config?.textAlign || 'left' }}>
                                                <h2
                                                    className={`font-black text-slate-900 mb-8 tracking-tighter leading-none ${selectedSection.style_config?.fontPrimary || 'font-sans'} ${selectedSection.style_config?.titleItalic ? 'italic' : ''} ${selectedSection.style_config?.titleUppercase !== false ? 'uppercase' : ''}`}
                                                    style={{
                                                        fontSize: `${(selectedSection.style_config?.titleSize || 48) * 0.7}px`,
                                                        letterSpacing: `${selectedSection.style_config?.letterSpacing || 0}px`
                                                    }}
                                                >
                                                    {selectedSection.title || 'Our Kitchen Story'}
                                                </h2>
                                                <p className="text-xl text-slate-600 font-medium leading-relaxed italic mb-8">"{selectedSection.body || 'Healthy organic plant-based meals.'}"</p>
                                                <div className="space-y-6">
                                                    {(selectedSection.list_items || [
                                                        { icon: '🥑', title: 'Farm-to-Table', desc: 'Directly sourced items.' },
                                                        { icon: '🔥', title: 'Traditional', desc: 'Slow-simmered perfection.' }
                                                    ]).map((item, i) => (
                                                        <div key={i} className={`flex items-center gap-4 ${selectedSection.style_config?.textAlign === 'right' ? 'flex-row-reverse' : ''}`}>
                                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100">{item.icon}</div>
                                                            <div>
                                                                <p className="font-black text-slate-900 text-sm">{item.title}</p>
                                                                <p className="text-[10px] text-slate-500 font-medium tracking-tight">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                                                    <div className="absolute bottom-10 left-10 text-white z-20">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-70">Kitchen Environment</p>
                                                        <p className="font-black text-2xl italic uppercase font-serif">Clean & Professional</p>
                                                    </div>
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ImageIcon size={64} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <section
                                            className="p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden"
                                            style={{
                                                background: `linear-gradient(135deg, ${selectedSection.style_config?.from || '#0d9488'}, ${selectedSection.style_config?.to || '#059669'})`,
                                                textAlign: selectedSection.style_config?.textAlign || 'center'
                                            }}
                                        >
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                            <div className={`relative z-10 ${selectedSection.style_config?.textAlign === 'left' ? 'max-w-2xl text-left' : selectedSection.style_config?.textAlign === 'right' ? 'max-w-2xl ml-auto text-right' : 'max-w-2xl mx-auto'}`}>
                                                <h2
                                                    className={`font-black mb-8 tracking-tighter leading-none ${selectedSection.style_config?.fontPrimary || 'font-sans'} ${selectedSection.style_config?.titleItalic ? 'italic' : ''} ${selectedSection.style_config?.titleUppercase !== false ? 'uppercase' : ''}`}
                                                    style={{
                                                        fontSize: `${selectedSection.style_config?.titleSize || 64}px`,
                                                        letterSpacing: `${selectedSection.style_config?.letterSpacing || 0}px`
                                                    }}
                                                >
                                                    {selectedSection.title}
                                                </h2>
                                                <p className="text-white/80 text-lg font-medium mb-12 leading-relaxed italic">
                                                    {selectedSection.body}
                                                </p>
                                                <button
                                                    className="px-10 py-5 rounded-4xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                                                    style={{
                                                        background: selectedSection.style_config?.buttonBg || '#ffffff',
                                                        color: selectedSection.style_config?.buttonText || '#0d9488'
                                                    }}
                                                >
                                                    {selectedSection.cta_text}
                                                </button>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

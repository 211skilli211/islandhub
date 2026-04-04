'use client';

import { useState } from 'react';
import { X, Smartphone, Monitor, Sparkles, Users, Timer, Tag, ShoppingBag, Flame, Gem, Gift, Megaphone, Shield, Building2, Utensils, Briefcase, Target, Store } from 'lucide-react';
import toast from 'react-hot-toast';

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (banner: BannerFormData) => Promise<void>;
    initialData?: BannerFormData;
    mode: 'create' | 'edit';
}

export interface BannerFormData {
    title: string;
    subtitle: string;
    target_url: string;
    image_url: string;
    location: string;
    color_theme: string;
    mobile_mode: 'hero' | 'floating';
    url_pattern?: string;
    match_type?: 'exact' | 'starts_with' | 'contains';
    template_type: 'standard' | 'urgency' | 'community' | 'promotion';
    alignment: 'left' | 'center' | 'right';
    icon?: string;
    layout_preset: 'standard' | 'hero' | 'floating' | 'minimal' | 'overlay' | 'split' | 'glass' | 'glow' | 'neon';
    // Enhanced controls
    background_opacity?: number;
    texture_pattern?: 'none' | 'dots' | 'lines' | 'waves' | 'noise' | 'gradient';
    texture_opacity?: number;
    overlay_color?: string;
    overlay_opacity?: number;
    // Button controls
    show_button?: boolean;
    button_text?: string;
    button_style?: 'filled' | 'outline' | 'ghost' | 'gradient';
    button_text_color?: string;
    button_bg_color?: string;
}

const COLOR_THEMES = [
    { name: 'Teal', value: 'teal', from: 'from-teal-500', to: 'to-emerald-500', bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-500', gradient: 'from-teal-500/20 to-emerald-500/20' },
    { name: 'Indigo', value: 'indigo', from: 'from-indigo-500', to: 'to-purple-500', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-500', gradient: 'from-indigo-500/20 to-purple-500/20' },
    { name: 'Rose', value: 'rose', from: 'from-rose-500', to: 'to-pink-500', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-500', gradient: 'from-rose-500/20 to-pink-500/20' },
    { name: 'Amber', value: 'amber', from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-500', gradient: 'from-amber-500/20 to-orange-500/20' },
    { name: 'Emerald', value: 'emerald', from: 'from-emerald-500', to: 'to-green-500', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-500', gradient: 'from-emerald-500/20 to-green-500/20' },
    { name: 'Blue', value: 'blue', from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-500', gradient: 'from-blue-500/20 to-cyan-500/20' },
    { name: 'Violet', value: 'violet', from: 'from-violet-500', to: 'to-fuchsia-500', bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-500', gradient: 'from-violet-500/20 to-fuchsia-500/20' },
    { name: 'Slate', value: 'slate', from: 'from-slate-500', to: 'to-gray-500', bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-500', gradient: 'from-slate-500/20 to-gray-500/20' },
];

const LOCATIONS = [
    { label: 'Home Hero', value: 'home_hero' },
    { label: 'Marketplace Hero', value: 'marketplace_hero' },
    { label: 'Rentals Hero', value: 'rentals_hero' },
    { label: 'Food Hero', value: 'food_hero' },
    { label: 'Shop Hero', value: 'shop_hero' },
    { label: 'Services Hero', value: 'service_hero' },
    { label: 'Community Hero', value: 'community_hero' },
    { label: 'Campaigns Hero', value: 'campaigns_hero' },
    { label: 'Vendor Store Hero', value: 'vendor_store_hero' },
    { label: 'Profile Hero', value: 'profile_hero' },
];

const ICONS = [
    { emoji: '✨', icon: Sparkles },
    { emoji: '🚨', icon: Timer },
    { emoji: '🏷️', icon: Tag },
    { emoji: '🏝️', icon: Building2 },
    { emoji: '🔥', icon: Flame },
    { emoji: '💎', icon: Gem },
    { emoji: '🎉', icon: Gift },
    { emoji: '🎁', icon: Gift },
    { emoji: '📣', icon: Megaphone },
    { emoji: '🛡️', icon: Shield },
    { emoji: '🛍️', icon: ShoppingBag },
    { emoji: '🍽️', icon: Utensils },
    { emoji: '⚙️', icon: Target },
    { emoji: '👥', icon: Users },
    { emoji: '🎯', icon: Target },
    { emoji: '🏪', icon: Store },
];

const LAYOUT_PRESETS = [
    {
        id: 'standard',
        name: 'Standard',
        description: 'Classic card with image on left, text on right',
        icon: '⬜'
    },
    {
        id: 'hero',
        name: 'Hero',
        description: 'Full-width hero style with background',
        icon: '🖼️'
    },
    {
        id: 'floating',
        name: 'Floating',
        description: 'Compact floating notification style',
        icon: '💬'
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Text and icon only, no image',
        icon: '✏️'
    },
    {
        id: 'overlay',
        name: 'Overlay',
        description: 'Image background with text overlay',
        icon: '🎨'
    },
    {
        id: 'split',
        name: 'Split',
        description: '50/50 split with image and text side by side',
        icon: '⚡'
    },
    {
        id: 'glass',
        name: 'Glassmorphism',
        description: 'Frosted glass effect with vibrant accents',
        icon: '💎'
    },
    {
        id: 'glow',
        name: 'Floating Glow',
        description: 'Soft outer glow and floating animation',
        icon: '🌟'
    },
    {
        id: 'neon',
        name: 'Neon Pulse',
        description: 'Vibrant neon borders and pulsing effects',
        icon: '🌈'
    },
];


// Texture patterns for banner backgrounds
const TEXTURE_PATTERNS = [
    { id: 'none', name: 'None', icon: '🚫', css: '' },
    { id: 'dots', name: 'Dots', icon: '🔘', css: 'bg-[radial-gradient(#currentColor_1px,transparent_1px)] [background-size:16px_16px]' },
    { id: 'lines', name: 'Lines', icon: '〰️', css: 'bg-[repeating-linear-gradient(45deg,#currentColor_0px,#currentColor_1px,transparent_1px,transparent_8px)]' },
    { id: 'waves', name: 'Waves', icon: '🌊', css: 'bg-[url(\"data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23currentColor\' fill-opacity=\'0.1\' d=\'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E\")]' },
    { id: 'noise', name: 'Noise', icon: '📺', css: 'bg-[url(\"data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E\")]' },
    { id: 'gradient', name: 'Soft Gradient', icon: '🎭', css: 'bg-gradient-to-br from-white/10 to-transparent' },
];

export default function BannerModal({ isOpen, onClose, onSave, initialData, mode }: BannerModalProps) {
    const [formData, setFormData] = useState<BannerFormData>(initialData || {
        title: '',
        subtitle: '',
        target_url: '',
        image_url: '',
        location: 'marketplace_hero',
        color_theme: 'teal',
        mobile_mode: 'floating',
        url_pattern: '',
        match_type: 'exact',
        template_type: 'standard',
        alignment: 'left',
        icon: '✨',
        layout_preset: 'standard',
        // Enhanced controls - defaults
        background_opacity: 100,
        texture_pattern: 'none',
        texture_opacity: 25,
        overlay_color: '#000000',
        overlay_opacity: 0,
        // Button controls - defaults
        show_button: true,
        button_text: 'Learn More',
        button_style: 'filled',
        button_text_color: '#ffffff',
        button_bg_color: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.url_pattern) {
            toast.error('Title and at least one page target are required');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            toast.success(mode === 'create' ? 'Banner created!' : 'Banner updated!');
            onClose();
        } catch (error) {
            toast.error('Failed to save banner');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedTheme = COLOR_THEMES.find(t => t.value === formData.color_theme) || COLOR_THEMES[0];
    const selectedLayout = LAYOUT_PRESETS.find(l => l.id === formData.layout_preset) || LAYOUT_PRESETS[0];

    // Get the icon component for preview
    const getIconComponent = (emoji: string) => {
        const iconData = ICONS.find(i => i.emoji === emoji);
        return iconData?.icon || Sparkles;
    };

    const IconComponent = getIconComponent(formData.icon || '✨');

    // Get template specific styling
    const getTemplateStyles = () => {
        switch (formData.template_type) {
            case 'urgency':
                return {
                    badge: '🔥 Urgent',
                    badgeColor: 'bg-red-500 text-white',
                    animation: 'animate-pulse',
                    borderStyle: 'border-2 border-red-400 shadow-red-500/20',
                };
            case 'community':
                return {
                    badge: '👥 Community',
                    badgeColor: 'bg-purple-500 text-white',
                    animation: '',
                    borderStyle: 'border-2 border-purple-400',
                };
            case 'promotion':
                return {
                    badge: '🏷️ Special Offer',
                    badgeColor: 'bg-amber-500 text-white',
                    animation: '',
                    borderStyle: 'border-2 border-amber-400',
                };
            default:
                return {
                    badge: '',
                    badgeColor: '',
                    animation: '',
                    borderStyle: 'border border-white/20',
                };
        }
    };

    const templateStyles = getTemplateStyles();

    // Alignment classes
    const getAlignmentClasses = () => {
        switch (formData.alignment) {
            case 'center': return 'text-center items-center justify-center';
            case 'right': return 'text-right items-end justify-end';
            default: return 'text-left items-start justify-start';
        }
    };

    // Button color helper - uses custom colors or falls back to theme
    const getButtonClasses = (additionalClasses = '') => {
        const bgColor = formData.button_bg_color || selectedTheme.bg;
        const textColor = formData.button_text_color || 'text-white';
        return `mt-2 px-4 py-2 ${bgColor} ${textColor} text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity w-fit ${additionalClasses}`;
    };

    const renderStandardPreview = () => (
        <div className={`relative overflow-hidden rounded-2xl ${templateStyles.borderStyle} shadow-lg`}>
            {templateStyles.badge && (
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${templateStyles.badgeColor}`}>
                    {templateStyles.badge}
                </div>
            )}
            <div className={`flex flex-col ${formData.alignment === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-4 p-6 bg-linear-to-br ${selectedTheme.gradient} ${getAlignmentClasses()}`}>
                {formData.image_url && (
                    <div className="shrink-0">
                        <img
                            src={formData.image_url}
                            alt="Banner"
                            className="w-full md:w-32 h-32 object-cover rounded-xl shadow-md"
                        />
                    </div>
                )}
                <div className={`flex-1 flex flex-col gap-2 ${getAlignmentClasses()}`}>
                    <div className={`w-12 h-12 rounded-xl ${selectedTheme.light} flex items-center justify-center shadow-sm`}>
                        <IconComponent className={`w-6 h-6 ${selectedTheme.text}`} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {formData.title || 'Banner Title'}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {formData.subtitle || 'Banner subtitle description goes here'}
                    </p>
                    {formData.target_url && formData.show_button && (
                        <button className={getButtonClasses()}>
                            {formData.button_text || 'Learn More'} →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderHeroPreview = () => (
        <div className={`relative overflow-hidden rounded-2xl ${templateStyles.borderStyle} shadow-lg min-h-[200px]`}>
            {formData.image_url ? (
                <div className="absolute inset-0">
                    <img src={formData.image_url} alt="Banner" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-${formData.alignment === 'right' ? 'l' : formData.alignment === 'center' ? 't' : 'r'} ${selectedTheme.from} ${selectedTheme.to} opacity-80`} />
                </div>
            ) : (
                <div className={`absolute inset-0 bg-linear-to-br ${selectedTheme.from} ${selectedTheme.to}`} />
            )}
            <div className={`relative p-8 flex flex-col ${getAlignmentClasses()} min-h-[200px] justify-center`}>
                {templateStyles.badge && (
                    <div className={`mb-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white inline-block w-fit`}>
                        {templateStyles.badge}
                    </div>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg mb-4`}>
                    <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                    {formData.title || 'Banner Title'}
                </h3>
                <p className="text-base text-white/90 font-medium leading-relaxed max-w-md">
                    {formData.subtitle || 'Banner subtitle description goes here'}
                </p>
                {formData.target_url && (
                    <button
                        className={`mt-4 px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg hover:opacity-90 transition-colors ${!formData.button_bg_color ? 'bg-white text-slate-900 hover:bg-white/90' : ''}`}
                        style={formData.button_bg_color || formData.button_text_color ? {
                            backgroundColor: formData.button_bg_color || 'white',
                            color: formData.button_text_color || '#0f172a'
                        } : undefined}
                    >
                        Get Started →
                    </button>
                )}
            </div>
        </div>
    );

    const renderFloatingPreview = () => (
        <div className={`max-w-sm mx-auto rounded-2xl ${templateStyles.borderStyle} shadow-2xl overflow-hidden`}>
            <div className={`bg-linear-to-br ${selectedTheme.gradient} p-5 relative`}>
                <button className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600">
                    <X size={14} />
                </button>
                <div className={`flex ${formData.alignment === 'right' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                    <div className={`w-10 h-10 rounded-xl ${selectedTheme.light} flex items-center justify-center shrink-0`}>
                        <IconComponent className={`w-5 h-5 ${selectedTheme.text}`} />
                    </div>
                    <div className={`flex-1 ${getAlignmentClasses()}`}>
                        {templateStyles.badge && (
                            <div className={`mb-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${templateStyles.badgeColor} inline-block`}>
                                {templateStyles.badge}
                            </div>
                        )}
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                            {formData.title || 'Banner Title'}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-snug">
                            {formData.subtitle || 'Banner subtitle goes here'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMinimalPreview = () => (
        <div className={`rounded-2xl ${templateStyles.borderStyle} shadow-lg bg-linear-to-br ${selectedTheme.gradient} p-6`}>
            <div className={`flex ${formData.alignment === 'center' ? 'flex-col items-center' : formData.alignment === 'right' ? 'flex-row-reverse' : 'flex-row'} gap-4 items-start`}>
                <div className={`w-12 h-12 rounded-2xl ${selectedTheme.bg} flex items-center justify-center shrink-0 shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className={`flex-1 ${getAlignmentClasses()}`}>
                    {templateStyles.badge && (
                        <div className={`mb-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${templateStyles.badgeColor} inline-block`}>
                            {templateStyles.badge}
                        </div>
                    )}
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {formData.title || 'Banner Title'}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium mt-1">
                        {formData.subtitle || 'Banner subtitle description goes here'}
                    </p>
                    {formData.target_url && formData.show_button && (
                        <a
                            href="#"
                            className={`mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline`}
                            style={{ color: formData.button_text_color || undefined }}
                        >
                            {formData.button_text || 'Learn More'} <span>→</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );

    const renderOverlayPreview = () => (
        <div className={`relative overflow-hidden rounded-2xl ${templateStyles.borderStyle} shadow-lg`}>
            {formData.image_url ? (
                <div className="relative h-48">
                    <img src={formData.image_url} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
                    <div className={`absolute bottom-0 left-0 right-0 p-6 ${getAlignmentClasses()}`}>
                        {templateStyles.badge && (
                            <div className={`mb-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${templateStyles.badgeColor} inline-block`}>
                                {templateStyles.badge}
                            </div>
                        )}
                        <div className={`flex ${formData.alignment === 'center' ? 'justify-center' : formData.alignment === 'right' ? 'justify-end' : 'justify-start'} items-center gap-2 mb-2`}>
                            <IconComponent className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                {formData.title || 'Banner Title'}
                            </h3>
                        </div>
                        <p className="text-sm text-white/80 font-medium">
                            {formData.subtitle || 'Banner subtitle description goes here'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className={`h-48 bg-linear-to-br ${selectedTheme.from} ${selectedTheme.to} p-6 flex flex-col ${getAlignmentClasses()} justify-end`}>
                    {templateStyles.badge && (
                        <div className={`mb-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white inline-block`}>
                            {templateStyles.badge}
                        </div>
                    )}
                    <div className={`flex ${formData.alignment === 'center' ? 'justify-center' : formData.alignment === 'right' ? 'justify-end' : 'justify-start'} items-center gap-2 mb-2`}>
                        <IconComponent className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                            {formData.title || 'Banner Title'}
                        </h3>
                    </div>
                    <p className="text-sm text-white/80 font-medium">
                        {formData.subtitle || 'Banner subtitle description goes here'}
                    </p>
                </div>
            )}
        </div>
    );

    const renderSplitPreview = () => (
        <div className={`flex ${formData.alignment === 'right' ? 'flex-row-reverse' : 'flex-row'} overflow-hidden rounded-2xl ${templateStyles.borderStyle} shadow-lg`}>
            <div className="w-1/2 relative">
                {formData.image_url ? (
                    <img src={formData.image_url} alt="Banner" className="w-full h-full object-cover min-h-[200px]" />
                ) : (
                    <div className={`w-full h-full min-h-[200px] bg-linear-to-br ${selectedTheme.from} ${selectedTheme.to} flex items-center justify-center`}>
                        <IconComponent className="w-12 h-12 text-white/50" />
                    </div>
                )}
                {templateStyles.badge && (
                    <div className={`absolute top-3 ${formData.alignment === 'right' ? 'right-3' : 'left-3'} px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${templateStyles.badgeColor}`}>
                        {templateStyles.badge}
                    </div>
                )}
            </div>
            <div className={`w-1/2 bg-linear-to-br ${selectedTheme.gradient} p-6 flex flex-col ${getAlignmentClasses()} justify-center`}>
                <div className={`w-10 h-10 rounded-xl ${selectedTheme.light} flex items-center justify-center mb-3`}>
                    <IconComponent className={`w-5 h-5 ${selectedTheme.text}`} />
                </div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
                    {formData.title || 'Banner Title'}
                </h3>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {formData.subtitle || 'Banner subtitle description goes here'}
                </p>
                {formData.target_url && (
                    <button className={getButtonClasses('mt-3')}>
                        Learn More →
                    </button>
                )}
            </div>
        </div>
    );

    const renderPreview = () => {
        if (previewMode === 'mobile') {
            return (
                <div className="max-w-[320px] mx-auto">
                    {formData.mobile_mode === 'floating' ? renderFloatingPreview() : renderHeroPreview()}
                </div>
            );
        }

        switch (formData.layout_preset) {
            case 'hero': return renderHeroPreview();
            case 'floating': return renderFloatingPreview();
            case 'minimal': return renderMinimalPreview();
            case 'overlay': return renderOverlayPreview();
            case 'split': return renderSplitPreview();
            case 'glass': return renderGlassPreview();
            case 'glow': return renderGlowPreview();
            case 'neon': return renderNeonPreview();
            default: return renderStandardPreview();
        }
    };

    const renderGlassPreview = () => (
        <div className={`relative overflow-hidden rounded-3xl border border-white/40 shadow-2xl transition-all duration-500 hover:scale-[1.02]`}>
            <div className={`absolute inset-0 bg-linear-to-br ${selectedTheme.gradient} opacity-20`} />
            <div className="absolute inset-0 backdrop-blur-2xl" />
            <div className={`relative p-8 flex flex-col md:flex-row gap-6 items-center ${getAlignmentClasses()}`}>
                {formData.image_url && (
                    <div className="relative group">
                        <div className={`absolute -inset-2 bg-linear-to-r ${selectedTheme.from} ${selectedTheme.to} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
                        <img
                            src={formData.image_url}
                            alt="Banner"
                            className="relative w-32 h-32 object-cover rounded-2xl border border-white/20 shadow-xl"
                        />
                    </div>
                )}
                <div className={`flex-1 flex flex-col gap-3 ${getAlignmentClasses()}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner`}>
                            <IconComponent className={`w-5 h-5 text-white`} />
                        </div>
                        {templateStyles.badge && (
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${templateStyles.badgeColor} shadow-lg`}>
                                {templateStyles.badge}
                            </span>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                        {formData.title || 'Premium Glass'}
                    </h3>
                    <p className="text-sm text-white/80 font-bold leading-relaxed max-w-lg drop-shadow-sm">
                        {formData.subtitle || 'Sophisticated design with deep blur and vibrant accents.'}
                    </p>
                    {formData.target_url && (
                        <button className="mt-2 px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 transition-all active:scale-95">
                            {formData.button_text || 'Experience'} →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderGlowPreview = () => (
        <div className={`relative group`}>
            <div className={`absolute -inset-1 bg-linear-to-r ${selectedTheme.from} ${selectedTheme.to} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse`} />
            <div className={`relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 flex flex-col items-center text-center gap-4`}>
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${selectedTheme.from} ${selectedTheme.to} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/10 mb-2`}>
                    <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-3xl font-black text-transparent bg-clip-text bg-linear-to-r ${selectedTheme.from} ${selectedTheme.to} uppercase tracking-tight`}>
                    {formData.title || 'Floating Glow'}
                </h3>
                <p className="text-slate-400 font-medium max-w-md">
                    {formData.subtitle || 'A dark-mode optimized design with vibrant pulsing glows.'}
                </p>
                {formData.target_url && (
                    <button className={`mt-2 px-10 py-4 bg-linear-to-r ${selectedTheme.from} ${selectedTheme.to} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all`}>
                        {formData.button_text || 'Get Glowing'}
                    </button>
                )}
            </div>
        </div>
    );

    const renderNeonPreview = () => (
        <div className="relative overflow-hidden rounded-2xl bg-black border-2 border-white/5 p-8">
            <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-${selectedTheme.value}-500 to-transparent opacity-50 shadow-[0_0_15px_#currentColor]`} />
            <div className={`flex flex-col md:flex-row gap-8 items-center ${getAlignmentClasses()}`}>
                <div className={`w-24 h-24 rounded-full border-2 border-${selectedTheme.value}-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5),inset_0_0_10px_rgba(0,0,0,0.5)] bg-slate-900/50`}>
                    <IconComponent className={`w-10 h-10 text-${selectedTheme.value}-400 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]`} />
                </div>
                <div className={`flex-1 ${getAlignmentClasses()}`}>
                    <h3 className={`text-4xl font-black text-white uppercase italic tracking-tighter mb-1`}>
                        {formData.title || 'Neon Pulse'}
                    </h3>
                    <div className={`h-0.5 w-24 bg-${selectedTheme.value}-500 mb-4 shadow-[0_0_10px_#currentColor]`} />
                    <p className={`text-${selectedTheme.value}-400/80 font-black uppercase text-[10px] tracking-widest`}>
                        {formData.subtitle || 'Cyber-themed energetic design.'}
                    </p>
                    {formData.target_url && (
                        <button className={`mt-6 px-6 py-3 border-2 border-${selectedTheme.value}-500 text-${selectedTheme.value}-400 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-${selectedTheme.value}-500 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(0,0,0,0.3)]`}>
                            {formData.button_text || 'Connect'}
                        </button>
                    )}
                </div>
            </div>
            <div className={`absolute bottom-0 right-0 w-full h-1 bg-linear-to-r from-transparent via-${selectedTheme.value}-500 to-transparent opacity-50 shadow-[0_0_15px_#currentColor]`} />
        </div>
    );


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center shrink-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {mode === 'create' ? 'Create Promotional Banner' : 'Edit Banner'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Design and preview your banner before publishing
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel - Form */}
                    <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Banner Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Summer Sale - 50% Off!"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                required
                            />
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="e.g., Limited time offer on all products"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* Target URL */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Target URL
                            </label>
                            <input
                                type="url"
                                value={formData.target_url}
                                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                                placeholder="https://example.com/promo"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Banner Image (Optional)
                            </label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('banner-upload')?.click()}
                                            className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-teal-500 transition-all text-slate-400 hover:text-teal-600"
                                        >
                                            {formData.image_url ? (
                                                <img src={formData.image_url} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <>
                                                    <span className="text-2xl mb-2">📷</span>
                                                    <span className="text-xs font-black uppercase tracking-widest">Select Image</span>
                                                </>
                                            )}
                                        </button>
                                        <input
                                            id="banner-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setFormData({ ...formData, image_url: url });
                                                }
                                            }}
                                        />
                                        {formData.image_url && (
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toast('Image editing - use upload to replace')}
                                                    className="bg-white/50 text-slate-400 p-2 rounded-lg font-bold text-[10px] uppercase shadow-lg cursor-not-allowed opacity-50"
                                                    disabled
                                                >
                                                    ✂️ Crop
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, image_url: '' })}
                                                    className="bg-white text-rose-500 p-2 rounded-lg font-bold text-[10px] uppercase shadow-lg hover:bg-rose-50"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layout Presets */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Layout Style *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {LAYOUT_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, layout_preset: preset.id as any })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.layout_preset === preset.id
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className="text-2xl">{preset.icon}</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">{preset.name}</p>
                                        <p className="text-[9px] text-slate-500 text-center leading-tight">{preset.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Location *
                            </label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                required
                            >
                                {LOCATIONS.map(loc => (
                                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Page Targets */}
                        <div className="bg-linear-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                📍 Show Banner On These Pages
                            </label>
                            <p className="text-xs text-slate-500 mb-4">
                                Select which pages should display this banner. You can choose multiple pages.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[
                                    { label: 'Home', value: 'home', icon: '🏠' },
                                    { label: 'Marketplace', value: 'marketplace', icon: '🛍️' },
                                    { label: 'Rentals', value: 'rentals', icon: '🏖️' },
                                    { label: 'Food', value: 'food', icon: '🍽️' },
                                    { label: 'Shop', value: 'shop', icon: '🛒' },
                                    { label: 'Services', value: 'services', icon: '⚙️' },
                                    { label: 'Community', value: 'community', icon: '👥' },
                                    { label: 'Campaigns', value: 'campaigns', icon: '🎯' },
                                    { label: 'Stores', value: 'stores', icon: '🏪' },
                                ].map(page => {
                                    const isSelected = (formData.url_pattern || '').split(',').includes(page.value);
                                    return (
                                        <button
                                            key={page.value}
                                            type="button"
                                            onClick={() => {
                                                const current = (formData.url_pattern || '').split(',').filter(Boolean);
                                                const updated = isSelected
                                                    ? current.filter(p => p !== page.value)
                                                    : [...current, page.value];
                                                setFormData({ ...formData, url_pattern: updated.join(',') });
                                            }}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isSelected
                                                ? 'bg-teal-600 text-white shadow-lg'
                                                : 'bg-white border border-slate-300 text-slate-600 hover:border-teal-400'
                                                }`}
                                        >
                                            <span>{page.icon}</span>
                                            <span>{page.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.url_pattern && (
                                <p className="text-xs text-teal-700 font-medium mt-3">
                                    ✓ Will appear on: {(formData.url_pattern || '').split(',').filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Mobile Display Mode */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Mobile Display Mode
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mobile_mode: 'hero' })}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.mobile_mode === 'hero'
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">📱</div>
                                    <p className="text-xs font-bold text-slate-700 mb-1">Hero Embed</p>
                                    <p className="text-[10px] text-slate-500">Shows in hero section</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mobile_mode: 'floating' })}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.mobile_mode === 'floating'
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">💬</div>
                                    <p className="text-xs font-bold text-slate-700 mb-1">Floating Card</p>
                                    <p className="text-[10px] text-slate-500">Overlay at bottom</p>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {formData.mobile_mode === 'hero'
                                    ? '✓ Desktop & Mobile: Banner appears in hero section'
                                    : '✓ Desktop: Hero section | Mobile: Dismissible floating card'}
                            </p>
                        </div>

                        {/* Template Type */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Template Style
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { id: 'standard', label: 'Standard', icon: '✨' },
                                    { id: 'urgency', label: 'Urgency', icon: '🚨' },
                                    { id: 'community', label: 'Community', icon: '🤝' },
                                    { id: 'promotion', label: 'Promotion', icon: '🏷️' }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, template_type: item.id as any })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.template_type === item.id
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Alignment */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Content Alignment</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['left', 'center', 'right'].map((align) => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, alignment: align as any })}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.alignment === align ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400'}`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Icon Overlay</label>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-8 gap-1">
                                        {ICONS.map(({ emoji }) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: emoji })}
                                                className={`h-9 rounded-lg text-lg flex items-center justify-center transition-all ${formData.icon === emoji ? 'bg-teal-100 border border-teal-500' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.icon || ''}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="Or type custom emoji..."
                                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color Theme */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                Color Palette
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {COLOR_THEMES.map(theme => (
                                    <button
                                        key={theme.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color_theme: theme.value })}
                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.color_theme === theme.value
                                            ? `${theme.border} ${theme.light}`
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-full h-8 rounded-lg bg-linear-to-r ${theme.gradient}`} />
                                        <p className="text-[10px] font-black uppercase text-slate-700">{theme.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Enhanced Controls: Texture, Opacity, & Custom Colors */}
                        <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">🎨</span>
                                <label className="block text-sm font-bold text-slate-700">
                                    Enhanced Appearance Controls
                                </label>
                            </div>

                            <div className="space-y-6">
                                {/* Texture Pattern */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                        Background Texture
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TEXTURE_PATTERNS.map(pattern => (
                                            <button
                                                key={pattern.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, texture_pattern: pattern.id as any })}
                                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${formData.texture_pattern === pattern.id
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <span className="text-lg">{pattern.icon}</span>
                                                <p className="text-[9px] font-medium text-slate-600">{pattern.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Texture Opacity */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Texture Opacity
                                        </label>
                                        <span className="text-xs font-bold text-teal-600">{formData.texture_opacity || 25}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.texture_opacity || 25}
                                        onChange={(e) => setFormData({ ...formData, texture_opacity: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Background Opacity */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Background Opacity
                                        </label>
                                        <span className="text-xs font-bold text-teal-600">{formData.background_opacity || 100}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="100"
                                        value={formData.background_opacity || 100}
                                        onChange={(e) => setFormData({ ...formData, background_opacity: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Overlay Color & Opacity */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                            Overlay Color
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.overlay_color || '#000000'}
                                                onChange={(e) => setFormData({ ...formData, overlay_color: e.target.value })}
                                                className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={formData.overlay_color || '#000000'}
                                                onChange={(e) => setFormData({ ...formData, overlay_color: e.target.value })}
                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Overlay Opacity
                                            </label>
                                            <span className="text-xs font-bold text-teal-600">{formData.overlay_opacity || 0}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="80"
                                            value={formData.overlay_opacity || 0}
                                            onChange={(e) => setFormData({ ...formData, overlay_opacity: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Button Toggle & Text */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                            Show Button
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, show_button: !formData.show_button })}
                                            className={`w-full py-2 rounded-lg text-xs font-bold capitalize transition-all border-2 ${formData.show_button
                                                ? 'border-teal-500 bg-teal-50 text-teal-600'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            {formData.show_button ? '✓ Visible' : '○ Hidden'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.button_text || 'Learn More'}
                                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                            placeholder="e.g., Shop Now"
                                            disabled={!formData.show_button}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Button Style */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                        Button Style
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['filled', 'outline', 'ghost', 'gradient'].map(style => (
                                            <button
                                                key={style}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, button_style: style as any })}
                                                disabled={!formData.show_button}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all border-2 ${formData.button_style === style
                                                    ? 'border-teal-500 bg-teal-50 text-teal-600'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 disabled:opacity-50'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Button Colors */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                            Button Text Color
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.button_text_color || '#ffffff'}
                                                onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                                                disabled={!formData.show_button}
                                                className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer disabled:opacity-50"
                                            />
                                            <input
                                                type="text"
                                                value={formData.button_text_color || '#ffffff'}
                                                onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                                                disabled={!formData.show_button}
                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                            Button Background
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={formData.button_bg_color || selectedTheme?.bg || '#0d9488'}
                                                onChange={(e) => setFormData({ ...formData, button_bg_color: e.target.value })}
                                                disabled={!formData.show_button}
                                                className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer disabled:opacity-50"
                                            />
                                            <input
                                                type="text"
                                                value={formData.button_bg_color || ''}
                                                onChange={(e) => setFormData({ ...formData, button_bg_color: e.target.value })}
                                                placeholder="Use theme color"
                                                disabled={!formData.show_button}
                                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : mode === 'create' ? 'Create Banner' : 'Update Banner'}
                            </button>
                        </div>
                    </form>

                    {/* Right Panel - Live Preview */}
                    <div className="w-[400px] bg-slate-50 border-l border-slate-200 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                    Live Preview
                                </h3>
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('desktop')}
                                        className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Monitor size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('mobile')}
                                        className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Smartphone size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                See exactly how your banner will appear on the site
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Context Labels */}
                            <div className="mb-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Layout:</span>
                                    <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-full">
                                        {selectedLayout.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Template:</span>
                                    <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-full capitalize">
                                        {formData.template_type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Theme:</span>
                                    <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-full">
                                        {selectedTheme.name}
                                    </span>
                                </div>
                            </div>

                            {/* Actual Preview */}
                            <div className="space-y-6">
                                {renderPreview()}
                            </div>

                            {/* Info Cards */}
                            <div className="mt-6 space-y-3">
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-900 uppercase mb-2 flex items-center gap-2">
                                        <Sparkles size={12} className="text-teal-500" />
                                        Layout Features
                                    </h4>
                                    <ul className="text-[11px] text-slate-600 space-y-1">
                                        <li>• {selectedLayout.description}</li>
                                        <li>• Responsive {previewMode} view</li>
                                        {formData.image_url && <li>• Custom image support</li>}
                                        {formData.icon && <li>• Icon overlay: {formData.icon}</li>}
                                    </ul>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-900 uppercase mb-2">
                                        Appearance Settings
                                    </h4>
                                    <div className="space-y-2 text-[11px]">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Alignment:</span>
                                            <span className="font-medium text-slate-900 capitalize">{formData.alignment}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Mobile Mode:</span>
                                            <span className="font-medium text-slate-900 capitalize">{formData.mobile_mode}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Color Theme:</span>
                                            <div className={`w-4 h-4 rounded ${selectedTheme.bg}`} />
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Template Type:</span>
                                            <span className="font-medium text-slate-900 capitalize">{formData.template_type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth';

const INITIAL_FORM_STATE = {
    branding_color: '#0d9488',
    secondary_color: '#0f172a',
    promo_video_url: '',
    audio_intro_url: '',
    bio: '',
    theme_color: '#0d9488',
    name: '',
    hero_title: '',
    show_hero_title: true,
    // Expanded Fields
    hero_subtitle: '',
    hero_cta_text: '',
    hero_cta_link: '',
    hero_cta2_text: '',
    hero_cta2_link: '',
    hero_icon_url: '',
    branding_icon_url: '',
    typography: {
        model: 'classic',
        align: 'left',
        heading: { model: 'classic', color: '#ffffff', size: 72, effect: '', custom_font: '' },
        subtitle: { model: 'classic', color: 'rgba(255,255,255,0.8)', size: 24, effect: '', custom_font: '' }
    } as any,
    description: '',
    location: '',
    logo_url: '',
    banner_url: '',
    delivery_enabled: false,
    delivery_fee: 0,
    slug: '',
    template_id: ''
};

export default function VendorBranding({ storeId }: { storeId?: number }) {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [vendor, setVendor] = useState<any>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    useEffect(() => {
        setFormData(INITIAL_FORM_STATE);
        setVendor(null);
        if (storeId) fetchVendor();
    }, [storeId]);

    const fetchVendor = async () => {
        setLoading(true);
        try {
            const [vendorRes, storeRes] = await Promise.all([
                api.get('/vendors/me').catch(err => {
                    console.error('Vendor profile fetch failed:', err);
                    return { data: null };
                }),
                api.get(storeId ? `/api/stores/slug/${storeId}` : '/stores/my').catch(err => {
                    console.error('Store data fetch failed:', err);
                    return { data: {} };
                })
            ]);

            if (vendorRes.data) {
                setVendor(vendorRes.data);
                // ALWAYS prioritize store-specific branding if available
                setFormData({
                    branding_color: storeRes.data.branding_color || vendorRes.data.branding_color || '#0d9488',
                    secondary_color: storeRes.data.secondary_color || vendorRes.data.secondary_color || '#0f172a',
                    promo_video_url: storeRes.data.promo_video_url || vendorRes.data.promo_video_url || '',
                    audio_intro_url: storeRes.data.audio_intro_url || vendorRes.data.audio_intro_url || '',
                    bio: storeRes.data.bio || vendorRes.data.bio || '',
                    theme_color: storeRes.data.theme_color || vendorRes.data.theme_color || '#0d9488',
                    name: storeRes.data.name || vendorRes.data.business_name || '',
                    hero_title: storeRes.data.hero_title || '',
                    show_hero_title: storeRes.data.show_hero_title !== false,
                    hero_subtitle: storeRes.data.hero_subtitle || '',
                    hero_cta_text: storeRes.data.hero_cta_text || '',
                    hero_cta_link: storeRes.data.hero_cta_link || '',
                    hero_cta2_text: storeRes.data.hero_cta2_text || '',
                    hero_cta2_link: storeRes.data.hero_cta2_link || '',
                    hero_icon_url: storeRes.data.hero_icon_url || '',
                    branding_icon_url: storeRes.data.branding_icon_url || '',
                    typography: storeRes.data.typography || { model: 'classic', align: 'left' },
                    description: storeRes.data.description || vendorRes.data.description || '',
                    location: storeRes.data.location || vendorRes.data.location || '',
                    logo_url: storeRes.data.logo_url || '',
                    banner_url: storeRes.data.banner_url || '',
                    delivery_enabled: storeRes.data.delivery_enabled || false,
                    delivery_fee: storeRes.data.delivery_fee || 0,
                    slug: storeRes.data.slug || '',
                    template_id: storeRes.data.template_id || ''
                });
            } else {
                toast.error('Could not load vendor profile. Please refresh the dashboard.');
            }
        } catch (error) {
            console.error('Unexpected error in fetchVendor:', error);
            toast.error('An unexpected error occurred while loading branding data.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading asset...', { id: 'upload' });
            const res = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [field]: res.data.url }));
            toast.success('Asset uploaded!', { id: 'upload' });
        } catch (error) {
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'heading' | 'subtitle') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('font', file);

        try {
            toast.loading(`Uploading font for ${target}...`, { id: 'font-upload' });
            const response = await api.post('/uploads/font', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({
                ...prev,
                typography: {
                    ...(prev.typography || {}),
                    [target]: { ...(prev.typography?.[target] || {}), custom_font: response.data.url }
                }
            }));
            toast.success('Font uploaded!', { id: 'font-upload' });
        } catch (error) {
            toast.error('Font upload failed', { id: 'font-upload' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update both vendor profile and store info
            await Promise.all([
                api.put('/vendors/me', {
                    ...formData,
                    business_name: formData.name, // Keep in sync
                }),
                api.put('/stores/my', {
                    storeId: storeId,
                    name: formData.name,
                    hero_title: formData.hero_title,
                    show_hero_title: formData.show_hero_title,
                    hero_subtitle: formData.hero_subtitle,
                    hero_cta_text: formData.hero_cta_text,
                    hero_cta_link: formData.hero_cta_link,
                    hero_cta2_text: formData.hero_cta2_text,
                    hero_cta2_link: formData.hero_cta2_link,
                    hero_icon_url: formData.hero_icon_url,
                    branding_icon_url: formData.branding_icon_url,
                    typography: formData.typography,
                    description: formData.description,
                    logo_url: formData.logo_url,
                    banner_url: formData.banner_url,
                    delivery_enabled: formData.delivery_enabled,
                    delivery_fee: formData.delivery_fee,
                    slug: formData.slug,
                    template_id: formData.template_id
                })
            ]);
            toast.success('Store Branding & Info updated successfully!');
            fetchVendor();
        } catch (error) {
            toast.error('Failed to update storefront information');
        } finally {
            setLoading(false);
        }
    };

    // Handle loading state
    if (loading) {
        return <div className="p-20 text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600" /></div>;
    }

    // If no vendor profile exists, show onboarding CTA
    if (!vendor) {
        return (
            <div className="p-20 text-center bg-linear-to-br from-slate-50 to-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Set Up Your Store</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">Create your first store to unlock branding customization and start selling on IslandHub.</p>
                <a
                    href="/start"
                    className="inline-block px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-teal-100"
                >
                    Create Your Store
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            <header>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Storefront Branding & Info</h3>
                <p className="text-sm font-medium text-slate-400">Manage how your shop appears to the island</p>
            </header>

            <section className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase">Storefront Template</h4>
                        <p className="text-sm text-indigo-100/70 font-medium max-w-md">Select the specialized layout that best fits your business model. This changes how your shop and items are presented to customers.</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            {[
                                { id: 'food_vendor', label: 'Food Vendor', icon: '🥘', desc: 'Menus & Orders' },
                                { id: 'host_rental', label: 'Host / Rental', icon: '🏡', desc: 'Booking & Fleet' },
                                { id: 'service_provider', label: 'Service Pro', icon: '🛠️', desc: 'Appointments' },
                                { id: 'retail_produce', label: 'Retail / Fresh', icon: '🛍️', desc: 'Catalog & Stock' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, template_id: t.id }))}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.template_id === t.id ? 'bg-white text-indigo-900 border-white shadow-xl scale-105' : 'bg-indigo-800/50 border-indigo-700/50 text-indigo-200 hover:border-indigo-400'}`}
                                >
                                    <span className={`text-3xl transition-transform ${formData.template_id === t.id ? 'scale-110' : 'group-hover:scale-110'}`}>{t.icon}</span>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{t.label}</p>
                                        <p className={`text-[8px] font-bold ${formData.template_id === t.id ? 'text-indigo-400' : 'text-indigo-400/50'}`}>{t.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
            </section>

            <form onSubmit={handleSubmit} className="space-y-12">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Storefront Imagery</h4>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo Upload */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Logo / Avatar</label>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-slate-50 rounded-4xlrder-2 border-slate-100 text-center sm:text-left">
                            <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden relative shrink-0">
                                {formData.logo_url ? (
                                    <img src={getImageUrl(formData.logo_url)} className="w-full h-full object-contain" alt="Logo" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-200">🖼️</div>
                                )}
                            </div>
                            <div className="flex-1 space-y-3 w-full">
                                <p className="text-[10px] font-medium text-slate-500">Represent your brand with a high-quality logo (Square 1:1 recommended).</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                    <label className="inline-block px-4 sm:px-6 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
                                        {formData.logo_url ? 'Change' : 'Upload Logo'}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logo_url')} />
                                    </label>
                                    {formData.logo_url && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                                            className="px-4 sm:px-6 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hero Banner Image</label>
                        <div className="p-6 bg-slate-50 rounded-4xl border-2 border-slate-100 space-y-4">
                            <div className="w-full h-24 rounded-2xl bg-black border border-slate-200 overflow-hidden relative">
                                {formData.banner_url ? (
                                    <img src={getImageUrl(formData.banner_url)} className="w-full h-full object-cover opacity-80" alt="Banner" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl font-black text-slate-500">🏝️ Hub Background</div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <p className="text-[10px] font-medium text-slate-500">Wide panoramic image for your store header.</p>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    <label className="px-4 sm:px-6 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all flex-1 sm:flex-none text-center">
                                        {formData.banner_url ? 'Replace' : 'Choose'}
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner_url')} />
                                    </label>
                                    {formData.banner_url && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                                            className="px-4 sm:px-6 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex-1 sm:flex-none"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Hero Section Content</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Hero Title</label>
                            <input
                                value={formData.hero_title}
                                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold"
                                placeholder="Large catching header"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hero Subtitle</label>
                            <input
                                value={formData.hero_subtitle}
                                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold"
                                placeholder="Underlying text..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CTA Button Text</label>
                            <input
                                value={formData.hero_cta_text}
                                onChange={(e) => setFormData({ ...formData, hero_cta_text: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold shadow-sm"
                                placeholder="e.g. Order Now"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CTA Link (External or Path)</label>
                            <input
                                value={formData.hero_cta_link}
                                onChange={(e) => setFormData({ ...formData, hero_cta_link: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold shadow-sm"
                                placeholder="/menu or https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secondary CTA Text</label>
                            <input
                                value={formData.hero_cta2_text}
                                onChange={(e) => setFormData({ ...formData, hero_cta2_text: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold shadow-sm"
                                placeholder="e.g. Contact Us"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secondary CTA Link</label>
                            <input
                                value={formData.hero_cta2_link}
                                onChange={(e) => setFormData({ ...formData, hero_cta2_link: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold shadow-sm"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Refined Icon / Graphic Picker */}
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Graphic Overlay / Floating Icon</label>
                            <label className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-500 transition-all cursor-pointer">
                                Upload Graphic
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'hero_icon_url')} />
                            </label>
                        </div>

                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                            {['✨', '🏝️', '🔥', '💎', '🎉', '🎁', '📣', '🛡️', '🌿', '🌊', '☀️', '⭐', '🥘', '⚓', '🚙', '🏡', '🏨', '🛍️', '⚙️', '🎯'].map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, hero_icon_url: icon })}
                                    className={`h-12 rounded-xl text-xl flex items-center justify-center transition-all ${formData.hero_icon_url === icon ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-white border border-slate-200 hover:border-indigo-300'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Custom URL or Emoji</label>
                                <input
                                    value={formData.hero_icon_url}
                                    onChange={(e) => setFormData({ ...formData, hero_icon_url: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 transition-all text-sm font-bold shadow-sm"
                                    placeholder="Paste URL or type emoji..."
                                />
                            </div>
                            {formData.hero_icon_url && (
                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm self-end overflow-hidden shrink-0">
                                    {formData.hero_icon_url.startsWith('http') ? <img src={getImageUrl(formData.hero_icon_url)} className="w-full h-full object-contain p-2" /> : formData.hero_icon_url}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="space-y-8">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-4">Aesthetic & Typography</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Heading Styles */}
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Title Styling</h5>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.typography?.heading?.color || '#ffffff'}
                                        onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, heading: { ...(formData.typography?.heading || {}), color: e.target.value } } })}
                                        className="w-6 h-6 rounded-full overflow-hidden border-none cursor-pointer"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400">{formData.typography?.heading?.color || '#FFFFFF'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={formData.typography?.heading?.model || 'classic'}
                                    onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, heading: { ...(formData.typography?.heading || {}), model: e.target.value } } })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                >
                                    <option value="classic">Classic Font</option>
                                    <option value="modern">Modern Font</option>
                                    <option value="serif">Elegant Serif</option>
                                    <option value="display">Island Display</option>
                                </select>
                                <input
                                    type="number"
                                    value={formData.typography?.heading?.size || 72}
                                    onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, heading: { ...(formData.typography?.heading || {}), size: parseInt(e.target.value) } } })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                    placeholder="Size (px)"
                                />
                            </div>

                            <div className="flex gap-2">
                                {['', 'glow', 'outline', 'soft'].map(effect => (
                                    <button
                                        key={effect}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, typography: { ...formData.typography, heading: { ...(formData.typography?.heading || {}), effect } } })}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.typography?.heading?.effect === effect ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        {effect || 'Plain'}
                                    </button>
                                ))}
                            </div>

                            <label className="flex items-center justify-center px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:border-indigo-400 transition-all cursor-pointer">
                                {formData.typography?.heading?.custom_font ? 'Change Custom Font' : 'Upload Heading Font (.ttf)'}
                                <input type="file" className="hidden" accept=".ttf,.otf" onChange={(e) => handleFontUpload(e, 'heading')} />
                            </label>
                        </div>

                        {/* Subtitle Styles */}
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
                            <div className="flex justify-between items-center">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Subtitle Styling</h5>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.typography?.subtitle?.color || '#ffffffcc'}
                                        onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, subtitle: { ...(formData.typography?.subtitle || {}), color: e.target.value } } })}
                                        className="w-6 h-6 rounded-full overflow-hidden border-none cursor-pointer"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400">{formData.typography?.subtitle?.color || '#FFFFFFCC'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={formData.typography?.subtitle?.model || 'classic'}
                                    onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, subtitle: { ...(formData.typography?.subtitle || {}), model: e.target.value } } })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                >
                                    <option value="classic">Classic Font</option>
                                    <option value="modern">Modern Font</option>
                                    <option value="serif">Elegant Serif</option>
                                </select>
                                <input
                                    type="number"
                                    value={formData.typography?.subtitle?.size || 24}
                                    onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, subtitle: { ...(formData.typography?.subtitle || {}), size: parseInt(e.target.value) } } })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                    placeholder="Size (px)"
                                />
                            </div>

                            <div className="flex gap-2">
                                {['', 'glow', 'outline', 'soft'].map(effect => (
                                    <button
                                        key={effect}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, typography: { ...formData.typography, subtitle: { ...(formData.typography?.subtitle || {}), effect } } })}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.typography?.subtitle?.effect === effect ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        {effect || 'Plain'}
                                    </button>
                                ))}
                            </div>

                            <label className="flex items-center justify-center px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:border-indigo-400 transition-all cursor-pointer">
                                {formData.typography?.subtitle?.custom_font ? 'Change Custom Font' : 'Upload Subtitle Font (.ttf)'}
                                <input type="file" className="hidden" accept=".ttf,.otf" onChange={(e) => handleFontUpload(e, 'subtitle')} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Overall Text Alignment</label>
                            <div className="flex gap-2 p-1.5 bg-slate-50 rounded-3xl border-2 border-slate-100">
                                {['left', 'center', 'right'].map(align => (
                                    <button
                                        key={align}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, typography: { ...formData.typography, align } })}
                                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.typography?.align === align ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Overall Tone / Model</label>
                            <select
                                value={formData.typography?.model || 'classic'}
                                onChange={(e) => setFormData({ ...formData, typography: { ...formData.typography, model: e.target.value } })}
                                className="w-full px-8 py-4.5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold appearance-none shadow-sm"
                            >
                                <option value="classic">Classic Premium</option>
                                <option value="modern">Modern Brutalist</option>
                                <option value="serif">Elegant Serif</option>
                                <option value="display">Island Display</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Name</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold"
                                placeholder="e.g. Ital Vegan Kitchen"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Location</label>
                            <input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold"
                                placeholder="e.g. Charlestown, Nevis"
                            />
                        </div>
                        <div className="space-y-2 p-6 bg-slate-50 rounded-3xl border-2 border-indigo-100 shadow-sm transition-all hover:bg-white hover:border-indigo-300">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🔗</span>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store Slug (Custom URL)</label>
                            </div>
                            <div className="relative">
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold pr-32"
                                    placeholder="your-store-name"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                                    islandhub.com/store/
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium">
                                Your public identity on IslandHub: <span className="text-indigo-500 font-bold">https://islandhub.com/store/{formData.slug || '...'}</span>
                            </p>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Public Description / Motto</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-medium h-24 resize-none"
                                placeholder="A brief description of your store's mission..."
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Media Immersion</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Promotional Video</label>
                            <div className="p-6 rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 bg-slate-50/50 group hover:border-indigo-300 transition-all">
                                {formData.promo_video_url ? (
                                    <div className="w-full aspect-video rounded-xl bg-black overflow-hidden relative">
                                        <video src={getImageUrl(formData.promo_video_url)} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setFormData({ ...formData, promo_video_url: '' })}
                                            className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-lg"
                                        >
                                            <span className="text-xs">✕</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <span className="text-3xl mb-2 block">🎬</span>
                                        <p className="text-[10px] font-black uppercase text-slate-500">Add Shop Intro Video</p>
                                    </div>
                                )}
                                <label className="bg-white px-6 py-2 rounded-xl text-[10px] font-black uppercase text-slate-900 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50">
                                    {formData.promo_video_url ? 'Replace' : 'Choose File'}
                                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleUpload(e, 'promo_video_url')} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Audio Greeting / Intro</label>
                            <div className="p-6 rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 bg-slate-50/50 group hover:border-teal-300 transition-all">
                                {formData.audio_intro_url ? (
                                    <div className="w-full py-4 px-6 rounded-xl bg-white border border-slate-200 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-teal-600">Audio Preview</span>
                                            <button onClick={() => setFormData({ ...formData, audio_intro_url: '' })} className="text-xs text-rose-500">Remove</button>
                                        </div>
                                        <audio src={getImageUrl(formData.audio_intro_url)} controls className="w-full h-8" />
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <span className="text-3xl mb-2 block">🎵</span>
                                        <p className="text-[10px] font-black uppercase text-slate-500">Upload Shop Atmosphere</p>
                                    </div>
                                )}
                                <label className="bg-white px-6 py-2 rounded-xl text-[10px] font-black uppercase text-slate-900 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50">
                                    {formData.audio_intro_url ? 'Replace' : 'Upload Audio'}
                                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, 'audio_intro_url')} />
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Logistics & Delivery</h4>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                            <div className="flex-1 space-y-1">
                                <h5 className="font-black text-slate-900 uppercase text-sm">Enable Island Delivery</h5>
                                <p className="text-[10px] font-medium text-slate-400">Allow customers to request delivery instead of pickup at checkout.</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end gap-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Delivery Fee ($)</label>
                                    <input
                                        type="number"
                                        value={formData.delivery_fee}
                                        onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) })}
                                        className="w-24 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-center appearance-none"
                                        disabled={!formData.delivery_enabled}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, delivery_enabled: !formData.delivery_enabled })}
                                    className={`w-16 h-8 rounded-full transition-all relative ${formData.delivery_enabled ? 'bg-teal-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.delivery_enabled ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
                    >
                        {loading ? 'Saving Branding...' : 'Update Store Branding'}
                    </button>
                </div>
            </form>
        </div>
    );
}

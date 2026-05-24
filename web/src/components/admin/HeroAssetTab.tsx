'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import toast from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getShaderNames, SHADERS } from '../shaders/shaderRegistry';
import ShaderBackground from '../shaders/ShaderBackground';
import ParticleField from '../shaders/ParticleField';
import { compressImage, formatFileSize } from '@/lib/image-compress';

interface StyleConfig {
  shader?: string;
  shaderName?: string;
  shaderColors?: string[];
  shaderSpeed?: number;
  shaderInteractive?: boolean;
  particleCount?: number;
  particleSpeed?: number;
  particleSize?: number;
  particleColor?: string;
  particleInteractive?: boolean;
  connectionDistance?: number;
  mouseRadius?: number;
  mouseForce?: number;
  showOverlay?: boolean;
  bgColor?: string;
  scale?: number;
  splitDivide?: number;
  overlayScale?: number;
  overlayAlign?: string;
  offsetY?: number;
  offsetX?: number;
  pattern?: string;
  patternColor?: string;
}

const PAGES = [
    { key: 'home', label: 'Homepage' },
    { key: 'marketplace', label: 'Marketplace' },
    { key: 'rental-hub', label: 'Rental Hub Overview' },
    { key: 'sea-rentals', label: 'Sea Hub (Aquatic)' },
    { key: 'stays', label: 'Stays Hub (Homes)' },
    { key: 'land-rentals', label: 'Land Hub (Mobility)' },
    { key: 'equipment-tools', label: 'Equipment Hub (Utility)' },
    { key: 'food-stores', label: 'Food Hub' },
    { key: 'product-stores', label: 'Product Hub' },
    { key: 'service-stores', label: 'Service Hub' },
    { key: 'campaigns', label: 'Campaigns Hub' },
    { key: 'community', label: 'Community Hub' },
    { key: 'taxi-hub', label: 'Taxi & Delivery Hub' },
    { key: 'tour-hub', label: 'Tour Hub (Global)' },
    { key: 'tour-sea', label: 'Tour Hub (Sea)' },
    { key: 'tour-land', label: 'Tour Hub (Land)' },
    { key: 'tour-rail', label: 'Tour Hub (Rail)' },
    { key: 'tour-adventure', label: 'Tour Hub (Adventure)' },
    { key: 'tour-charter', label: 'Tour Hub (Charter)' },
    { key: 'tour-culture', label: 'Tour Hub (Culture)' },
    { key: 'sponsored-strip', label: 'Sponsored Highlights (Global)' },
    // ── IBT Solutions Website (bquikr-solutions.onrender.com) ──
    { key: 'ibt-home', label: 'IBT — Homepage' },
    { key: 'ibt-services', label: 'IBT — Services Overview' },
    { key: 'ibt-services-ai', label: 'IBT — AI Services Page' },
    { key: 'ibt-services-web', label: 'IBT — Web Dev Page' },
    { key: 'ibt-services-audit', label: 'IBT — Business Audit Page' },
    { key: 'ibt-services-business', label: 'IBT — Business Automation Page' },
    { key: 'ibt-coops', label: 'IBT — Co-ops Directory' },
    { key: 'ibt-coops-trades', label: 'IBT — Trades Co-op' },
    { key: 'ibt-coops-micro-farms', label: 'IBT — Micro-Farms Co-op' },
    { key: 'ibt-coops-graphic-trends', label: 'IBT — Graphic Trends Co-op' },
    { key: 'ibt-coops-logistics', label: 'IBT — Logistics Co-op' },
    { key: 'ibt-portfolio', label: 'IBT — Portfolio' },
    { key: 'ibt-founder', label: 'IBT — Founder Page' },
    { key: 'ibt-contact', label: 'IBT — Contact' },
    // — IslandHub IBT store pages —
    { key: 'ibt-solutions-store', label: 'IslandHub — IBT Solutions Store' },
    { key: 'ibt-coops-directory', label: 'IslandHub — IBT Co-ops Directory' },
    { key: 'ibt-service-detail', label: 'IslandHub — IBT Service Detail' },
    // — Horizon Salt Co. —
    { key: 'horizon-salt', label: 'IBT — Horizon Salt Co. Landing' },
    { key: 'horizon-salt-store', label: 'IslandHub — Horizon Salt Store' },
];

export default function HeroAssetTab() {
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    
    const openMediaLibrary = (type: string) => {
        setSelectedAsset(type);
    };

    const [selectedPage, setSelectedPage] = useState(PAGES[0].key);
    const [assetUrl, setAssetUrl] = useState('');
    const [assetType, setAssetType] = useState<'image' | 'video' | 'shader' | 'particle'>('image');
    const [overlayColor, setOverlayColor] = useState('#000000');
    const [overlayOpacity, setOverlayOpacity] = useState(0.4);

    // Expanded Fields
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [cta2Text, setCta2Text] = useState('');
    const [cta2Link, setCta2Link] = useState('');
    const [showCta2, setShowCta2] = useState(false);
    const [iconUrl, setIconUrl] = useState('');
    const [typography, setTypography] = useState<any>({
        align: 'left',
        heading: { model: 'classic', color: '#ffffff', size: 72, effect: '', custom_font: '' },
        subtitle: { model: 'classic', color: 'rgba(255,255,255,0.8)', size: 24, effect: '', custom_font: '' }
    });
    const [layoutTemplate, setLayoutTemplate] = useState('standard');
    const [styleConfig, setStyleConfig] = useState<StyleConfig>({});

    const [expandedSections, setExpandedSections] = useState<string[]>(['background', 'content']);
    
    // ── Site Media State ──
    const [founderPhotoUrl, setFounderPhotoUrl] = useState('');
    const [ibtLogoUrl, setIbtLogoUrl] = useState('');
    const [uploadingFounder, setUploadingFounder] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [savingSiteMedia, setSavingSiteMedia] = useState(false);
    const [siteMediaLoaded, setSiteMediaLoaded] = useState(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingFont, setUploadingFont] = useState<'heading' | 'subtitle' | null>(null);
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    const showOverlay = styleConfig.showOverlay !== false;

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    useEffect(() => {
        const fetchAsset = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/admin/hero-assets/${selectedPage}`);
                if (response.data) {
                    setAssetUrl(response.data.asset_url || '');
                    setAssetType(response.data.asset_type || 'image');
                    setOverlayColor(response.data.overlay_color || '#000000');
                    setOverlayOpacity(response.data.overlay_opacity !== null ? parseFloat(response.data.overlay_opacity) : 0.4);

                    // Expanded data
                    setTitle(response.data.title || '');
                    setSubtitle(response.data.subtitle || '');
                    setCtaText(response.data.cta_text || '');
                    setCtaLink(response.data.cta_link || '');
                    setCta2Text(response.data.cta2_text || '');
                    setCta2Link(response.data.cta2_link || '');
                    setShowCta2(!!response.data.cta2_text);
                    setIconUrl(response.data.icon_url || '');
                    setTypography(response.data.typography || {});
                    setLayoutTemplate(response.data.layout_template || 'standard');
                    setStyleConfig(response.data.style_config || {});
                } else {
                    resetFields();
                }
            } catch (error) {
                resetFields();
            } finally {
                setLoading(false);
            }
        };
        fetchAsset();
    }, [selectedPage]);

    const resetFields = () => {
        setAssetUrl('');
        setAssetType('image');
        setOverlayColor('#000000');
        setOverlayOpacity(0.4);
        setTitle('');
        setSubtitle('');
        setCtaText('');
        setCtaLink('');
        setIconUrl('');
        setTypography({
            align: 'left',
            heading: { model: 'classic', color: '#ffffff', size: 72, effect: '', custom_font: '' },
            subtitle: { model: 'classic', color: 'rgba(255,255,255,0.8)', size: 24, effect: '', custom_font: '' }
        });
        setCta2Text('');
        setCta2Link('');
        setShowCta2(false);
        setLayoutTemplate('standard');
        setStyleConfig({});
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            // Compress image if it's larger than 2MB
            let fileToUpload = file;
            if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
                toast.loading('Compressing image...', { id: 'upload' });
                fileToUpload = await compressImage(file, {
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.8,
                    type: 'image/jpeg',
                });
                const saved = ((file.size - fileToUpload.size) / file.size * 100).toFixed(0);
                toast.success(`Image compressed (${saved}% smaller)`, { id: 'upload' });
            }

            const formData = new FormData();
            formData.append('image', fileToUpload);

            const response = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAssetUrl(response.data.url);
            if (file.type.startsWith('video/')) setAssetType('video');
            else setAssetType('image');

            toast.success('Hero asset uploaded');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Upload failed';
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPdf(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/uploads/document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAssetUrl(response.data.url);
            toast.success('PDF uploaded');
        } catch (error) {
            toast.error('PDF upload failed');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'heading' | 'subtitle') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFont(target);
        const formData = new FormData();
        formData.append('font', file);

        try {
            const response = await api.post('/uploads/font', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setTypography((prev: any) => ({
                ...prev,
                [target]: { ...prev[target], custom_font: response.data.url }
            }));
            toast.success(`${target} font uploaded!`);
        } catch (error) {
            toast.error('Font upload failed');
        } finally {
            setUploadingFont(null);
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingIcon(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIconUrl(response.data.url);
            toast.success('Icon graphic uploaded');
        } catch (error) {
            toast.error('Icon upload failed');
        } finally {
            setUploadingIcon(false);
        }
    };

    const handleSave = async () => {
        if (!assetUrl) {
            toast.error('Please provide an asset URL or upload a file');
            return;
        }

        setSaving(true);
        try {
            await api.post('/admin/hero-assets', {
                page_key: selectedPage,
                asset_url: assetUrl,
                asset_type: assetType,
                overlay_color: overlayColor,
                overlay_opacity: overlayOpacity,
                title,
                subtitle,
                cta_text: ctaText,
                cta_link: ctaLink,
                cta2_text: showCta2 ? cta2Text : null,
                cta2_link: showCta2 ? cta2Link : null,
                icon_url: iconUrl,
                typography,
                layout_template: layoutTemplate,
                style_config: styleConfig
            });
            toast.success('Hero asset updated successfully');
        } catch (error) {
            toast.error('Failed to update hero asset');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this hero asset and revert to default?')) return;

        try {
            await api.delete(`/admin/hero-assets/${selectedPage}`);
            toast.success('Hero asset removed');
            resetFields();
        } catch (error) {
            toast.error('Failed to delete hero asset');
        }
    };

    // ── Site Media: Load ──
    useEffect(() => {
        if (siteMediaLoaded) return;
        const loadSiteMedia = async () => {
            try {
                const res = await api.get('/site-settings');
                if (res.data && Array.isArray(res.data)) {
                    const settings: any = {};
                    res.data.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });
                    if (settings.founder_photo_url) setFounderPhotoUrl(settings.founder_photo_url);
                    if (settings.ibt_logo_url) setIbtLogoUrl(settings.ibt_logo_url);
                }
            } catch (err) {
                // silent fail — settings may not exist yet
            } finally {
                setSiteMediaLoaded(true);
            }
        };
        loadSiteMedia();
    }, [siteMediaLoaded]);

    // ── Site Media: Upload Handlers ──
    const handleFounderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFounder(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFounderPhotoUrl(res.data.url);
            toast.success('Founder photo uploaded');
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploadingFounder(false);
        }
    };

    const handleIbtLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIbtLogoUrl(res.data.url);
            toast.success('Logo uploaded');
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleRemoveFounderPhoto = () => {
        setFounderPhotoUrl('');
    };

    const handleRemoveIbtLogo = () => {
        setIbtLogoUrl('');
    };

    const handleSaveSiteMedia = async () => {
        setSavingSiteMedia(true);
        try {
            if (founderPhotoUrl) {
                await api.put('/site-settings', { setting_key: 'founder_photo_url', setting_value: founderPhotoUrl });
            } else {
                await api.put('/site-settings', { setting_key: 'founder_photo_url', setting_value: '' });
            }
            if (ibtLogoUrl) {
                await api.put('/site-settings', { setting_key: 'ibt_logo_url', setting_value: ibtLogoUrl });
            } else {
                await api.put('/site-settings', { setting_key: 'ibt_logo_url', setting_value: '' });
            }
            toast.success('Site media saved');
        } catch {
            toast.error('Failed to save site media');
        } finally {
            setSavingSiteMedia(false);
        }
    };

    const handleResetSiteMedia = () => {
        setFounderPhotoUrl('');
        setIbtLogoUrl('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase mb-2">Asset Configuration</h2>
                    <p className="text-slate-400 font-medium">Select a hub and configure its hero background.</p>
                </div>

                <div className="space-y-4">
                    {/* Section: Background */}
                    <div className="border border-slate-100 rounded-4xl overflow-hidden">
                        <button
                            onClick={() => toggleSection('background')}
                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-sm">🖼️</span>
                                Visual Background
                            </span>
                            <span className={`text-slate-400 transition-transform ${expandedSections.includes('background') ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('background') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-6 space-y-6 overflow-hidden"
                                >
                                    {/* Page Selector */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Target Hub / Page</label>
                                        <select
                                            value={selectedPage}
                                            onChange={(e) => setSelectedPage(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all"
                                        >
                                            {PAGES.map(p => (
                                                <option key={p.key} value={p.key}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Local Upload */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Local Asset Upload</label>
                                        <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${uploading ? 'bg-slate-50 border-slate-200' : 'hover:border-teal-500 bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                accept="image/*,video/*"
                                                disabled={uploading}
                                            />
                                            {uploading ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-2" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Uploading Magic...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl mb-2">📁</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Click or Drag Image/Video</span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-1">Supports MP4, JPG, PNG (Max 50MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* PDF Document Upload */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Upload Document (PDF)</label>
                                        <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${uploadingPdf ? 'bg-slate-50 border-slate-200' : 'hover:border-red-400 bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="file"
                                                onChange={handlePdfUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                accept="application/pdf"
                                                disabled={uploadingPdf}
                                            />
                                            {uploadingPdf ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Uploading PDF...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl mb-2">📄</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Click to Upload PDF</span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-1">For contracts, reports, guides (Max 25MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hero Background Type */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Background Type</label>
                                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                                            {[
                                                { key: 'image', label: '📷 Image' },
                                                { key: 'video', label: '🎬 Video' },
                                                { key: 'shader', label: '🎨 Shader' },
                                                { key: 'particle', label: '✨ Particles' },
                                            ].map(t => (
                                                <button
                                                    key={t.key}
                                                    onClick={() => setAssetType(t.key as any)}
                                                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${assetType === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shader Configuration */}
                                    {assetType === 'shader' && (
                                        <div className="space-y-5 p-5 bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl border border-purple-100">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-purple-600">Shader Effect</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {getShaderNames().map(s => (
                                                    <button
                                                        key={s.key}
                                                        onClick={() => setStyleConfig(prev => ({ ...prev, shader: s.key }))}
                                                        className={`p-3 rounded-xl text-xs font-bold transition-all text-left ${
                                                            (styleConfig.shader || styleConfig.shaderName) === s.key
                                                                ? 'bg-purple-600 text-white shadow-lg'
                                                                : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        <div>{s.name}</div>
                                                        <div className="text-[9px] font-normal opacity-70 mt-0.5">{s.description}</div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Shader Colors */}
                                            <div>
                                                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-2">Shader Colors</label>
                                                <div className="flex gap-2">
                                                    {[0, 1, 2, 3].map(i => (
                                                        <div key={i} className="flex-1">
                                                            <input
                                                                type="color"
                                                                value={(styleConfig.shaderColors || SHADERS[styleConfig.shader!]?.defaultColors || ['#0f766e', '#06b6d4', '#8b5cf6', '#ec4899'])[i]}
                                                                onChange={(e) => {
                                                                    const colors = [...(styleConfig.shaderColors || SHADERS[styleConfig.shader!]?.defaultColors || ['#0f766e', '#06b6d4', '#8b5cf6', '#ec4899'])];
                                                                    colors[i] = e.target.value;
                                                                    setStyleConfig(prev => ({ ...prev, shaderColors: colors }));
                                                                }}
                                                                className="w-full h-10 rounded-lg cursor-pointer border-0"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Animation Speed */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[9px] font-bold uppercase text-slate-500">Animation Speed</label>
                                                    <span className="text-[10px] font-black text-purple-600">{(styleConfig.shaderSpeed as number) || 1}x</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.25"
                                                    max="3"
                                                    step="0.25"
                                                    value={styleConfig.shaderSpeed || 1}
                                                    onChange={(e) => setStyleConfig(prev => ({ ...prev, shaderSpeed: parseFloat(e.target.value) }))}
                                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                                <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                                                    <span>Slow</span>
                                                    <span>Normal</span>
                                                    <span>Fast</span>
                                                </div>
                                            </div>

                                            {/* Mouse Interactivity Toggle */}
                                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-700">Mouse Interaction</div>
                                                    <div className="text-[8px] text-slate-400">Shader follows cursor movement</div>
                                                </div>
                                                <button
                                                    onClick={() => setStyleConfig(prev => ({ ...prev, shaderInteractive: !prev.shaderInteractive }))}
                                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                                        styleConfig.shaderInteractive ? 'bg-purple-600' : 'bg-slate-300'
                                                    }`}
                                                >
                                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                                                        styleConfig.shaderInteractive ? 'left-6' : 'left-0.5'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Particle Configuration */}
                                    {assetType === 'particle' && (
                                        <div className="space-y-5 p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-cyan-600">Particle Settings</label>

                                            {/* Particle Count */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[9px] font-bold uppercase text-slate-500">Count</label>
                                                    <span className="text-[10px] font-black text-cyan-600">{(styleConfig.particleCount as number) || 80}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="300"
                                                    step="10"
                                                    value={(styleConfig.particleCount as number) || 80}
                                                    onChange={(e) => setStyleConfig(prev => ({ ...prev, particleCount: parseInt(e.target.value) }))}
                                                    className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                />
                                                <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                                                    <span>Few</span>
                                                    <span>Default</span>
                                                    <span>Many</span>
                                                </div>
                                            </div>

                                            {/* Particle Speed */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[9px] font-bold uppercase text-slate-500">Speed</label>
                                                    <span className="text-[10px] font-black text-cyan-600">{(styleConfig.particleSpeed as number) || 0.5}x</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="5"
                                                    step="0.1"
                                                    value={styleConfig.particleSpeed || 0.5}
                                                    onChange={(e) => setStyleConfig(prev => ({ ...prev, particleSpeed: parseFloat(e.target.value) }))}
                                                    className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                />
                                                <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                                                    <span>Still</span>
                                                    <span>Normal</span>
                                                    <span>Fast</span>
                                                </div>
                                            </div>

                                            {/* Particle Size */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[9px] font-bold uppercase text-slate-500">Size</label>
                                                    <span className="text-[10px] font-black text-cyan-600">{(styleConfig.particleSize as number) || 2}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="6"
                                                    step="0.5"
                                                    value={styleConfig.particleSize || 2}
                                                    onChange={(e) => setStyleConfig(prev => ({ ...prev, particleSize: parseFloat(e.target.value) }))}
                                                    className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                />
                                                <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                                                    <span>Tiny</span>
                                                    <span>Normal</span>
                                                    <span>Large</span>
                                                </div>
                                            </div>

                                            {/* Connection Distance */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[9px] font-bold uppercase text-slate-500">Connection Distance</label>
                                                    <span className="text-[10px] font-black text-cyan-600">{(styleConfig.connectionDistance as number) || 120}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="40"
                                                    max="200"
                                                    step="10"
                                                    value={styleConfig.connectionDistance || 120}
                                                    onChange={(e) => setStyleConfig(prev => ({ ...prev, connectionDistance: parseInt(e.target.value) }))}
                                                    className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                />
                                            </div>

                                            {/* Particle Color */}
                                            <div>
                                                <label className="text-[9px] font-bold uppercase text-slate-500 mb-2 block">Particle Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={styleConfig.particleColor || '#06b6d4'}
                                                        onChange={(e) => setStyleConfig(prev => ({ ...prev, particleColor: e.target.value }))}
                                                        className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                                    />
                                                    <div className="flex-1 grid grid-cols-6 gap-1">
                                                        {['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#f97316', '#14b8a6', '#a855f7', '#ffffff', '#64748b'].map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => setStyleConfig(prev => ({ ...prev, particleColor: c }))}
                                                                className={`h-10 rounded-lg border-2 transition-all ${
                                                                    (styleConfig.particleColor || '#06b6d4') === c ? 'border-slate-900 scale-110' : 'border-transparent hover:border-slate-300'
                                                                }`}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mouse Interactivity Toggle */}
                                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-cyan-200">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-700">Mouse Repulsion</div>
                                                    <div className="text-[8px] text-slate-400">Particles react to cursor movement</div>
                                                </div>
                                                <button
                                                    onClick={() => setStyleConfig(prev => ({ ...prev, particleInteractive: !prev.particleInteractive }))}
                                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                                        styleConfig.particleInteractive ? 'bg-cyan-600' : 'bg-slate-300'
                                                    }`}
                                                >
                                                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                                                        styleConfig.particleInteractive ? 'left-6' : 'left-0.5'
                                                    }`} />
                                                </button>
                                            </div>

                                            {/* Mouse Radius (only when interactive) */}
                                            {styleConfig.particleInteractive && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-[9px] font-bold uppercase text-slate-500">Mouse Radius</label>
                                                        <span className="text-[10px] font-black text-cyan-600">{(styleConfig.mouseRadius as number) || 150}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="50"
                                                        max="300"
                                                        step="25"
                                                        value={styleConfig.mouseRadius || 150}
                                                        onChange={(e) => setStyleConfig(prev => ({ ...prev, mouseRadius: parseInt(e.target.value) }))}
                                                        className="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Asset URL — only for image/video */}
                                    {['image', 'video'].includes(assetType) && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Direct Asset URL</label>
                                        <input
                                            type="text"
                                            value={assetUrl}
                                            onChange={(e) => setAssetUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                    )}

                                    {/* Color Overlays */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Overlay</label>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                                <input
                                                    type="color"
                                                    value={overlayColor}
                                                    onChange={(e) => setOverlayColor(e.target.value)}
                                                    className="w-8 h-8 rounded-lg overflow-hidden border-none bg-transparent cursor-pointer"
                                                />
                                                <span className="font-mono text-[10px] font-bold text-slate-600 uppercase">{overlayColor}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Opacity: {Math.round(overlayOpacity * 100)}%</label>
                                            <div className="pt-3">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={overlayOpacity}
                                                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Layout & Resizing */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Hero Layout Type</label>
                                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                            {[
                                                { id: 'standard', label: 'Full', icon: '📺' },
                                                { id: 'split', label: 'Split', icon: '🌓' },
                                                { id: 'overlay', label: 'Overlay', icon: '⬜' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setLayoutTemplate(t.id)}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${layoutTemplate === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <span className="text-lg">{t.icon}</span>
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Mode Specific Controls */}
                                            {layoutTemplate === 'standard' && (
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">View Scale: {styleConfig.scale || 100}%</label>
                                                    <input
                                                        type="range"
                                                        min="100"
                                                        max="125"
                                                        step="1"
                                                        value={styleConfig.scale || 100}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, scale: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                    />
                                                    <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-tighter italic">* Fullscreen mode scale is limited to 100-125% for visual integrity.</p>
                                                </div>
                                            )}

                                            {layoutTemplate === 'split' && (
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Split Divide: {styleConfig.splitDivide || 50}%</label>
                                                        <input
                                                            type="range"
                                                            min="30"
                                                            max="70"
                                                            step="1"
                                                            value={styleConfig.splitDivide || 50}
                                                            onChange={(e) => setStyleConfig({ ...styleConfig, splitDivide: parseInt(e.target.value) })}
                                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Media Scale: {styleConfig.scale || 100}%</label>
                                                        <input
                                                            type="range"
                                                            min="100"
                                                            max="125"
                                                            step="1"
                                                            value={styleConfig.scale || 100}
                                                            onChange={(e) => setStyleConfig({ ...styleConfig, scale: parseInt(e.target.value) })}
                                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {layoutTemplate === 'overlay' && (
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Overlay Scale: {styleConfig.overlayScale || 100}%</label>
                                                        <input
                                                            type="range"
                                                            min="70"
                                                            max="130"
                                                            step="5"
                                                            value={styleConfig.overlayScale || 100}
                                                            onChange={(e) => setStyleConfig({ ...styleConfig, overlayScale: parseInt(e.target.value) })}
                                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Overlay Alignment</label>
                                                        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                                            {['left', 'center', 'right'].map(align => (
                                                                <button
                                                                    key={align}
                                                                    onClick={() => setStyleConfig({ ...styleConfig, overlayAlign: align })}
                                                                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${(styleConfig.overlayAlign || 'center') === align ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                                >
                                                                    {align}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Vertical Offset</label>
                                                <input
                                                    type="range"
                                                    min="-100"
                                                    max="100"
                                                    step="5"
                                                    value={styleConfig.offsetY || 0}
                                                    onChange={(e) => setStyleConfig({ ...styleConfig, offsetY: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section: Content */}
                    <div className="border border-slate-100 rounded-4xl overflow-hidden">
                        <button
                            onClick={() => toggleSection('content')}
                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">📝</span>
                                Hero Content & CTAs
                            </span>
                            <span className={`text-slate-400 transition-transform ${expandedSections.includes('content') ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('content') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-6 space-y-6 overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Hero Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Main Heading"
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Subtitle / Description</label>
                                            <textarea
                                                value={subtitle}
                                                onChange={(e) => setSubtitle(e.target.value)}
                                                placeholder="Hero description text..."
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all h-24 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* CTAs Section */}
                                    <div className="space-y-6 pt-4 border-t border-slate-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Primary CTA Text</label>
                                                <input
                                                    type="text"
                                                    value={ctaText}
                                                    onChange={(e) => setCtaText(e.target.value)}
                                                    placeholder="Explore Now"
                                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Primary Link</label>
                                                <input
                                                    type="text"
                                                    value={ctaLink}
                                                    onChange={(e) => setCtaLink(e.target.value)}
                                                    placeholder="/marketplace"
                                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-6">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div
                                                        onClick={() => setShowCta2(!showCta2)}
                                                        className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${showCta2 ? 'bg-teal-600 border-teal-600 shadow-lg shadow-teal-500/30' : 'bg-white border-slate-200 group-hover:border-teal-500'}`}
                                                    >
                                                        {showCta2 && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Add Secondary CTA Button</span>
                                                </label>
                                            </div>

                                            {showCta2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                >
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Secondary CTA Text</label>
                                                        <input
                                                            type="text"
                                                            value={cta2Text}
                                                            onChange={(e) => {
                                                                setCta2Text(e.target.value);
                                                                if (e.target.value && !showCta2) setShowCta2(true);
                                                            }}
                                                            placeholder="Contact Us"
                                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Secondary Link</label>
                                                        <input
                                                            type="text"
                                                            value={cta2Link}
                                                            onChange={(e) => setCta2Link(e.target.value)}
                                                            placeholder="/contact"
                                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all text-sm"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section: Graphic Overlay & Icon (Separate Section) */}
                    <div className="border border-slate-100 rounded-4xl overflow-hidden">
                        <button
                            onClick={() => toggleSection('icon')}
                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🎨</span>
                                Graphic Overlay & Icon
                            </span>
                            <span className={`text-slate-400 transition-transform ${expandedSections.includes('icon') ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('icon') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 py-6 sm:p-6 space-y-8 overflow-hidden"
                                >
                                    {/* Description and Upload Button */}
                                    <div className="flex flex-col gap-4">
                                        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                                            Add an icon or emoji that displays above the title in the hero section.
                                        </p>
                                        <label className="w-fit px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer">
                                            {uploadingIcon ? 'Uploading...' : '📤 Upload Custom Icon'}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleIconUpload} disabled={uploadingIcon} />
                                        </label>
                                    </div>

                                    {/* Preset Icons Grid */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Icon Library & Presets
                                            </label>
                                            <span className="text-[9px] font-bold text-teal-600 animate-pulse bg-teal-50 px-2 py-0.5 rounded-full">✨ Supports GIFs & Animated Icons</span>
                                        </div>
                                        <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-10 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            {[
                                                // Essentials & Vibe
                                                '✨', '🏝️', '🔥', '💎', '🎉', '🎁', '📣', '🛡️', '🌿', '🌊', '☀️', '⭐', '🥘', '⚓', '🚙', '🏡', '🏨', '🛍️', '⚙️', '🎯',
                                                // User Essentials (New Requests)
                                                '💰', '❤️', '👍', '🏷️', '💦', '🤝', '✅', '🔔', '📍', '🗺️', '🛒', '💳', '📦', '🚚', '🍳', '🥤', '🍦', '🍰', '🍎', '🥕',
                                                // Travel & Nautical
                                                '⛵', '🚤', '🚢', '🥥', '🍹', '🌴', '🏊', '🏄', '🤿', '📸', '🎒', '🚁', '✈️', '🛰️', '🧭', '🛖', '🎡', '🏖️',
                                                // Luxury & Business
                                                '👑', '🍷', '🥂', '👠', '🎩', '🏛️', '💼', '📊', '📈', '🔑', '🏠', '🏰', '🤵', '💄', '💍', '🚗', '🏎️',
                                                // Community & Activities
                                                '👥', '🙌', '💬', '📢', '🎾', '⚽', '🏌️', '🚴', '🧖', '💆', '🧘', '💃', '🎨', '🎭', '🎤', '🎬', '🧩', '🎸', '🕹️',
                                                // Food & Lifestyle
                                                '🍤', '🍣', '🍱', '🥗', '🍖', '🥣', '🥢', '🧊', '🧂', '🧺', '🕯️', '🛁', '🧸', '🧶', '🧥', '🧤', '🧣', '👢', '🧢'
                                            ].map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setIconUrl(icon)}
                                                    className={`aspect-square min-h-[48px] rounded-xl text-2xl flex items-center justify-center transition-all ${iconUrl === icon ? 'bg-teal-600 text-white shadow-lg scale-105 ring-2 ring-teal-400 ring-offset-2' : 'bg-white border border-slate-200 hover:border-teal-400 hover:scale-105'}`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Input and Preview */}
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Custom URL or Emoji
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={iconUrl}
                                                    onChange={(e) => setIconUrl(e.target.value)}
                                                    placeholder="Enter URL or paste an emoji..."
                                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                                                />
                                            </div>
                                            {iconUrl && (
                                                <div className="flex items-center gap-4 sm:gap-0">
                                                    <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm overflow-hidden p-2 shrink-0">
                                                        {(iconUrl.startsWith('http') || iconUrl.startsWith('/') || iconUrl.includes('uploads')) ? (
                                                            <img src={getImageUrl(iconUrl)} className="w-full h-full object-contain" />
                                                        ) : (
                                                            iconUrl
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIconUrl('')}
                                                        className="sm:hidden px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 rounded-xl transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Clear Button (Desktop) */}
                                    {iconUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setIconUrl('')}
                                            className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            ✕ Clear Icon Selection
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section: Typography */}
                    <div className="border border-slate-100 rounded-4xl overflow-hidden">
                        <button
                            onClick={() => toggleSection('styling')}
                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm">✨</span>
                                Style & Typography
                            </span>
                            <span className={`text-slate-400 transition-transform ${expandedSections.includes('styling') ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('styling') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-6 space-y-6 overflow-hidden"
                                >
                                    {/* Heading Styling Section */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Heading Styles</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={typography.heading?.color || '#ffffff'}
                                                    onChange={(e) => setTypography({ ...typography, heading: { ...typography.heading, color: e.target.value } })}
                                                    className="w-6 h-6 rounded-full overflow-hidden border-none cursor-pointer"
                                                />
                                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{typography.heading?.color || '#FFFFFF'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Aesthetic Model</label>
                                                <select
                                                    value={typography.heading?.model || 'classic'}
                                                    onChange={(e) => setTypography({ ...typography, heading: { ...typography.heading, model: e.target.value } })}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                >
                                                    <option value="classic">Classic</option>
                                                    <option value="modern">Modern</option>
                                                    <option value="serif">Serif</option>
                                                    <option value="display">Display</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Font Size (px)</label>
                                                <input
                                                    type="number"
                                                    value={typography.heading?.size || 72}
                                                    onChange={(e) => setTypography({ ...typography, heading: { ...typography.heading, size: parseInt(e.target.value) } })}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-[8px] font-black uppercase text-slate-400">Visual Effects</label>
                                                <button
                                                    onClick={() => setTypography({ ...typography, heading: { ...typography.heading, useGradient: !typography.heading?.useGradient } })}
                                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${typography.heading?.useGradient ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                                                >
                                                    Gradient: {typography.heading?.useGradient ? 'ON' : 'OFF'}
                                                </button>
                                            </div>
                                            {!typography.heading?.useGradient ? (
                                                <div className="flex gap-2">
                                                    {['', 'glow', 'outline', 'soft'].map(effect => (
                                                        <button
                                                            key={effect}
                                                            onClick={() => setTypography({ ...typography, heading: { ...typography.heading, effect } })}
                                                            className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${typography.heading?.effect === effect ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-400'}`}
                                                        >
                                                            {effect || 'None'}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Start Color</label>
                                                        <input
                                                            type="color"
                                                            value={typography.heading?.gradientStart || '#ffffff'}
                                                            onChange={(e) => setTypography({ ...typography, heading: { ...typography.heading, gradientStart: e.target.value } })}
                                                            className="w-full h-8 rounded-lg border-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">End Color</label>
                                                        <input
                                                            type="color"
                                                            value={typography.heading?.gradientEnd || '#14b8a6'}
                                                            onChange={(e) => setTypography({ ...typography, heading: { ...typography.heading, gradientEnd: e.target.value } })}
                                                            className="w-full h-8 rounded-lg border-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Angle: {typography.heading?.gradientAngle || 135}°</label>
                                                        <input
                                                            type="range"
                                                            min="0" max="360" step="15"
                                                            value={typography.heading?.gradientAngle || 135}
                                                            onChange={(e) => setTypography({ ...typography, heading: { ...typography.heading, gradientAngle: parseInt(e.target.value) } })}
                                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    {/* Subtitle Styling Section */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Subtitle Styles</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={typography.subtitle?.color || 'rgba(255,255,255,0.8)'}
                                                    onChange={(e) => setTypography({ ...typography, subtitle: { ...typography.subtitle, color: e.target.value } })}
                                                    className="w-6 h-6 rounded-full overflow-hidden border-none cursor-pointer"
                                                />
                                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{typography.subtitle?.color || '#FFFFFFCC'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Aesthetic Model</label>
                                                <select
                                                    value={typography.subtitle?.model || 'classic'}
                                                    onChange={(e) => setTypography({ ...typography, subtitle: { ...typography.subtitle, model: e.target.value } })}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                >
                                                    <option value="classic">Classic</option>
                                                    <option value="modern">Modern</option>
                                                    <option value="serif">Serif</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Font Size (px)</label>
                                                <input
                                                    type="number"
                                                    value={typography.subtitle?.size || 24}
                                                    onChange={(e) => setTypography({ ...typography, subtitle: { ...typography.subtitle, size: parseInt(e.target.value) } })}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-[8px] font-black uppercase text-slate-400">Subtitle Effects</label>
                                                <button
                                                    onClick={() => setTypography({ ...typography, subtitle: { ...typography.subtitle, useGradient: !typography.subtitle?.useGradient } })}
                                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${typography.subtitle?.useGradient ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                                                >
                                                    Gradient: {typography.subtitle?.useGradient ? 'ON' : 'OFF'}
                                                </button>
                                            </div>
                                            {typography.subtitle?.useGradient && (
                                                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Start Color</label>
                                                        <input
                                                            type="color"
                                                            value={typography.subtitle?.gradientStart || '#ffffff'}
                                                            onChange={(e) => setTypography({ ...typography, subtitle: { ...typography.subtitle, gradientStart: e.target.value } })}
                                                            className="w-full h-8 rounded-lg border-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">End Color</label>
                                                        <input
                                                            type="color"
                                                            value={typography.subtitle?.gradientEnd || '#14b8a6'}
                                                            onChange={(e) => setTypography({ ...typography, subtitle: { ...typography.subtitle, gradientEnd: e.target.value } })}
                                                            className="w-full h-8 rounded-lg border-none cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Alignment</label>
                                            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button
                                                        key={align}
                                                        onClick={() => setTypography({ ...typography, align })}
                                                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${typography?.align === align ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Overall Tone</label>
                                            <select
                                                value={typography?.model || 'classic'}
                                                onChange={(e) => setTypography({ ...typography, model: e.target.value })}
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-teal-500 transition-all text-sm"
                                            >
                                                <option value="classic">Premium</option>
                                                <option value="modern">Bold</option>
                                                <option value="serif">Elegant</option>
                                                <option value="display">Boutique</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section: Background Media */}
                    <div className="border border-slate-100 rounded-4xl overflow-hidden">
                        <button
                            onClick={() => toggleSection('background')}
                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🏞️</span>
                                Background Media
                            </span>
                            <span className={`text-slate-400 transition-transform ${expandedSections.includes('background') ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('background') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-6 space-y-6 overflow-hidden"
                                >
                                    {/* Asset Upload */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Media Asset</h4>
                                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                                            <div className="flex-1">
                                                <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Image or Video URL</label>
                                                <input
                                                    type="text"
                                                    value={assetUrl}
                                                    onChange={(e) => setAssetUrl(e.target.value)}
                                                    placeholder="Enter URL or upload..."
                                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => openMediaLibrary('asset')}
                                                className="px-6 py-4 bg-teal-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-600 transition-all shrink-0"
                                            >
                                                Upload
                                            </button>
                                        </div>
                                        {assetUrl && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm overflow-hidden shrink-0">
                                                    {assetType === 'video' ? (
                                                        <video src={getImageUrl(assetUrl)} className="w-full h-full object-cover" muted autoPlay loop />
                                                    ) : (
                                                        <img src={getImageUrl(assetUrl)} className="w-full h-full object-cover" alt="Asset Preview" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Media Type</label>
                                                    <select
                                                        value={assetType}
                                                        onChange={(e) => setAssetType(e.target.value as 'image' | 'video')}
                                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                    >
                                                        <option value="image">Image</option>
                                                        <option value="video">Video</option>
                                                    </select>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAssetUrl('')}
                                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 border border-red-200 rounded-xl transition-colors shrink-0"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Overlay & Background Controls */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Background & Overlay</h4>
                                            <button
                                                type="button"
                                                onClick={() => setStyleConfig({ ...styleConfig, showOverlay: !showOverlay })}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${showOverlay ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                                            >
                                                {showOverlay ? 'Overlay: ON' : 'Overlay: OFF'}
                                            </button>
                                        </div>
                                        {showOverlay && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Overlay Color</label>
                                                        <input
                                                            type="color"
                                                            value={overlayColor}
                                                            onChange={(e) => setOverlayColor(e.target.value)}
                                                            className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">BG Color (Behind Media)</label>
                                                        <input
                                                            type="color"
                                                            value={styleConfig.bgColor || '#000000'}
                                                            onChange={(e) => setStyleConfig({ ...styleConfig, bgColor: e.target.value })}
                                                            className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Overlay Opacity: {Math.round(overlayOpacity * 100)}%</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.05"
                                                        value={overlayOpacity}
                                                        onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                                                        className="w-full h-10 bg-white rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {!showOverlay && (
                                            <div>
                                                <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">BG Color (Behind Media)</label>
                                                <input
                                                    type="color"
                                                    value={styleConfig.bgColor || '#000000'}
                                                    onChange={(e) => setStyleConfig({ ...styleConfig, bgColor: e.target.value })}
                                                    className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Mode Specific Controls */}
                                    <div className="grid grid-cols-1 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Layout Specific Controls</h4>
                                        {layoutTemplate === 'standard' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">View Scale: {styleConfig.scale || 100}%</label>
                                                    <input
                                                        type="range"
                                                        min="100"
                                                        max="125"
                                                        step="1"
                                                        value={styleConfig.scale || 100}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, scale: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-3 ml-1">
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Vertical Offset: {styleConfig.offsetY || 0}px</label>
                                                        {styleConfig.offsetY !== 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setStyleConfig({ ...styleConfig, offsetY: 0 })}
                                                                className="text-[8px] font-black uppercase text-teal-500"
                                                            >
                                                                Reset
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-100"
                                                        max="100"
                                                        step="5"
                                                        value={styleConfig.offsetY || 0}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, offsetY: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {layoutTemplate === 'split' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Split Divide: {styleConfig.splitDivide || 50}%</label>
                                                    <input
                                                        type="range"
                                                        min="30"
                                                        max="70"
                                                        step="1"
                                                        value={styleConfig.splitDivide || 50}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, splitDivide: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Media Scale: {styleConfig.scale || 100}%</label>
                                                    <input
                                                        type="range"
                                                        min="100"
                                                        max="125"
                                                        step="1"
                                                        value={styleConfig.scale || 100}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, scale: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-3 ml-1">
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Horizontal Offset: {styleConfig.offsetX || 0}px</label>
                                                        {styleConfig.offsetX !== 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setStyleConfig({ ...styleConfig, offsetX: 0 })}
                                                                className="text-[8px] font-black uppercase text-teal-500"
                                                            >
                                                                Reset
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-100"
                                                        max="100"
                                                        step="5"
                                                        value={styleConfig.offsetX || 0}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, offsetX: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {layoutTemplate === 'overlay' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Overlay Scale: {styleConfig.overlayScale || 100}%</label>
                                                    <input
                                                        type="range"
                                                        min="70"
                                                        max="130"
                                                        step="5"
                                                        value={styleConfig.overlayScale || 100}
                                                        onChange={(e) => setStyleConfig({ ...styleConfig, overlayScale: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Overlay Alignment</label>
                                                    <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                                        {['left', 'center', 'right'].map(align => (
                                                            <button
                                                                key={align}
                                                                type="button"
                                                                onClick={() => setStyleConfig({ ...styleConfig, overlayAlign: align })}
                                                                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${(styleConfig.overlayAlign || 'center') === align ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                {align}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        Section: Site Media
                        ═══════════════════════════════════════════════════════════ */}
                    <div className="border border-slate-100 rounded-4xl overflow-hidden">
                        <button
                            onClick={() => toggleSection('site-media')}
                            className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-sm">👤</span>
                                Site Media &amp; Founder Photo
                            </span>
                            <span className={`text-slate-400 transition-transform ${expandedSections.includes('site-media') ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <AnimatePresence>
                            {expandedSections.includes('site-media') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-6 space-y-6 overflow-hidden"
                                >
                                    {/* Description */}
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Manage site-wide media assets like the founder photo displayed on the IBT Solutions founder page and IslandHub about page.
                                    </p>

                                    {/* Founder Photo */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Founder Photo</h4>
                                            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Used on: IBT Founder Page · IslandHub About</span>
                                        </div>

                                        {/* Current Photo Preview */}
                                        {founderPhotoUrl && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shrink-0">
                                                    <img src={getImageUrl(founderPhotoUrl)} alt="Founder" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-mono text-slate-400 truncate">{founderPhotoUrl}</p>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFounderPhoto}
                                                        className="mt-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        ✕ Remove Photo
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${uploadingFounder ? 'bg-slate-100 border-slate-300' : 'hover:border-teal-500 bg-white border-slate-200'}`}>
                                            <input
                                                type="file"
                                                onChange={handleFounderPhotoUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                disabled={uploadingFounder}
                                            />
                                            {uploadingFounder ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-2" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Uploading...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl mb-2">📷</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Click or Drag Founder Photo</span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-1">JPG, PNG, WebP (Max 10MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* IBT Solutions Site Logo */}
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">IBT Solutions Logo</h4>
                                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Used on: Navbar · Footer</span>
                                        </div>

                                        {ibtLogoUrl && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-2">
                                                    <img src={getImageUrl(ibtLogoUrl)} alt="IBT Logo" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-mono text-slate-400 truncate">{ibtLogoUrl}</p>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveIbtLogo}
                                                        className="mt-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        ✕ Remove Logo
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${uploadingLogo ? 'bg-slate-100 border-slate-300' : 'hover:border-indigo-500 bg-white border-slate-200'}`}>
                                            <input
                                                type="file"
                                                onChange={handleIbtLogoUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                disabled={uploadingLogo}
                                            />
                                            {uploadingLogo ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Uploading...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl mb-2">🏢</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Click or Drag Logo</span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-1">PNG, SVG, WebP with transparency recommended</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Save Site Media */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveSiteMedia}
                                            disabled={savingSiteMedia}
                                            className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-teal-700 transition-all disabled:opacity-50"
                                        >
                                            {savingSiteMedia ? 'Saving...' : 'Save Site Media'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResetSiteMedia}
                                            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-teal-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Publishing...' : 'Save & Publish Hub'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-8 py-5 bg-red-50 text-red-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Panel */}
            <div className="relative">
                <div className="sticky top-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase mb-2">Live Preview</h2>
                        <p className="text-slate-400 font-medium">How the hero section will look on {PAGES.find(p => p.key === selectedPage)?.label}.</p>
                    </div>

            <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl shadow-slate-300" style={{ backgroundColor: styleConfig.bgColor || '#000000' }}>
                        {/* Background / Media Layer */}
                        <div
                            className="absolute inset-0 z-0 transition-all duration-700"
                            style={layoutTemplate === 'split' ? {
                                width: `${100 - (styleConfig.splitDivide || 50)}%`,
                                left: `${styleConfig.splitDivide || 50}%`
                            } : { width: '100%', left: 0 }}
                        >
                            {assetType === 'shader' && styleConfig.shader ? (
                                <ShaderBackground
                                    shader={styleConfig.shader}
                                    colors={styleConfig.shaderColors}
                                    interactive={styleConfig.shaderInteractive}
                                    speed={styleConfig.shaderSpeed || 1}
                                    className="absolute inset-0"
                                />
                            ) : assetType === 'particle' ? (
                                <div className="absolute inset-0 bg-slate-900">
                                    <ParticleField
                                        count={styleConfig.particleCount || 80}
                                        color={styleConfig.particleColor || '#06b6d4'}
                                        speed={styleConfig.particleSpeed || 0.5}
                                        size={styleConfig.particleSize || 2}
                                        interactive={styleConfig.particleInteractive}
                                        mouseRadius={styleConfig.mouseRadius || 150}
                                        mouseForce={styleConfig.mouseForce || 0.8}
                                        connectionDistance={styleConfig.connectionDistance || 120}
                                    />
                                </div>
                            ) : assetUrl ? (
                                <div className="absolute inset-0 overflow-hidden">
                                    {assetType === 'video' ? (
                                        <video key={assetUrl} autoPlay loop muted className="w-full h-full object-cover" style={{ transform: `scale(${(styleConfig.scale || 100) / 100}) translateY(${styleConfig.offsetY || 0}px)` }}>
                                            <source src={getImageUrl(assetUrl)} type="video/mp4" />
                                        </video>
                                    ) : (
                                        <img src={getImageUrl(assetUrl)} className="w-full h-full object-cover" alt="Preview" style={{ transform: `scale(${(styleConfig.scale || 100) / 100}) translateY(${styleConfig.offsetY || 0}px)` }} />
                                    )}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                    <div className="text-center font-black italic text-slate-300 uppercase tracking-widest">
                                        <span className="text-4xl block mb-2 opacity-50">🖼️</span>
                                        No Asset Loaded
                                    </div>
                                </div>
                            )}

                            {/* Mock Overlays (Non-split) */}
                            {layoutTemplate !== 'split' && (
                                <>
                                    <div className="absolute inset-0 pointer-events-none z-5" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/30 pointer-events-none z-6" />
                                </>
                            )}
                        </div>

                        {/* Mock UI Content Layer */}
                        <div className={`absolute inset-0 z-10 flex ${layoutTemplate === 'split' ? 'items-center' : 'items-center justify-center'}`}>
                            <div className={`px-12 transition-all duration-700 ${layoutTemplate === 'split' ? 'text-left items-start' : 'max-w-md text-center'}`}
                                style={layoutTemplate === 'split' ? { width: `${styleConfig.splitDivide || 50}%` } : { width: '100%' }}
                            >
                                <div className={`flex flex-col transition-all duration-500 ${layoutTemplate === 'overlay' ? 'bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/10' :
                                    (layoutTemplate === 'overlay' ? (styleConfig.overlayAlign || 'center') : (typography?.align || 'center')) === 'center' ? 'items-center text-center' :
                                        (layoutTemplate === 'overlay' ? (styleConfig.overlayAlign || 'center') : (typography?.align || 'center')) === 'right' ? 'items-end text-right' : 'items-start text-left'
                                    }`}
                                    style={layoutTemplate === 'overlay' ? {
                                        padding: `${(32 * ((styleConfig.overlayScale || 100) / 100)).toFixed(0)}px`,
                                        maxWidth: `${(400 * ((styleConfig.overlayScale || 100) / 100)).toFixed(0)}px`,
                                        alignItems: (styleConfig.overlayAlign || 'center') === 'center' ? 'center' : (styleConfig.overlayAlign || 'center') === 'right' ? 'flex-end' : 'flex-start',
                                        textAlign: (styleConfig.overlayAlign || 'center') as any,
                                        margin: (styleConfig.overlayAlign || 'center') === 'center' ? '0 auto' : (styleConfig.overlayAlign || 'center') === 'right' ? '0 0 0 auto' : '0 auto 0 0'
                                    } : {}}
                                >
                                    {iconUrl && (
                                        <div className="w-12 h-12 mb-4 bg-white/10 backdrop-blur rounded-2xl p-2 border border-white/20">
                                            {(iconUrl.startsWith('http') || iconUrl.startsWith('/') || iconUrl.includes('uploads')) ? (
                                                <img src={getImageUrl(iconUrl)} className="w-full h-full object-contain" alt="Icon" />
                                            ) : (
                                                <span className="text-2xl">{iconUrl}</span>
                                            )}
                                        </div>
                                    )}

                                    <h1 className={`text-2xl font-black text-white mb-2 leading-tight transition-all ${typography?.heading?.model === 'modern' ? 'font-sans' :
                                        typography?.heading?.model === 'serif' ? 'font-serif' :
                                            typography?.heading?.model === 'display' ? 'uppercase tracking-tighter' : 'font-sans'
                                        }`} style={{
                                            color: typography?.heading?.color || 'white',
                                            fontSize: typography?.heading?.size ? `${Math.min(32, typography.heading.size / 2)}px` : '24px'
                                        }}>
                                        {title || 'Your Main Catchy Title'}
                                    </h1>

                                    <p className="text-[10px] text-white/70 font-medium mb-6 line-clamp-2" style={{
                                        color: typography?.subtitle?.color || 'rgba(255,255,255,0.7)',
                                        fontSize: typography?.subtitle?.size ? `${Math.min(14, typography.subtitle.size / 2)}px` : '10px'
                                    }}>
                                        {subtitle || 'This is your hero subtitle that provides more context.'}
                                    </p>

                                    <div className="flex gap-3">
                                        <div className="px-5 py-2 text-white rounded-xl font-black uppercase text-[8px] tracking-widest shadow-lg" style={{ backgroundColor: '#14b8a6' }}>
                                            {ctaText || 'Button'}
                                        </div>
                                        {showCta2 && cta2Text && (
                                            <div className="px-5 py-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl font-black uppercase text-[8px] tracking-widest">
                                                {cta2Text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 items-start">
                        <span className="text-xl">💡</span>
                        <p className="text-sm font-medium text-amber-800 leading-relaxed">
                            Changes saved here are <span className="font-black">live instantly</span>. Ensure high-resolution assets are used to maintain a premium feel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from '@/lib/toast';
import {
    Sparkles, Wind, Zap, Eye, EyeOff, Palette, Layers,
    ChevronDown, ChevronUp, RotateCcw, Save, ToggleLeft, ToggleRight
} from 'lucide-react';

interface VisualEffectsConfig {
    heroType: 'image' | 'video' | 'shader' | 'particle' | 'aurora' | 'gradient';
    heroPreset: string;
    particlesEnabled: boolean;
    particleIntensity: number; // 0-10
    animationsEnabled: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    kenBurnsEnabled: boolean;
    parallaxEnabled: boolean;
    glowEffectsEnabled: boolean;
    reducedMotion: boolean;
}

const DEFAULT_CONFIG: VisualEffectsConfig = {
    heroType: 'image',
    heroPreset: 'ocean',
    particlesEnabled: false,
    particleIntensity: 4,
    animationsEnabled: true,
    animationSpeed: 'normal',
    kenBurnsEnabled: true,
    parallaxEnabled: false,
    glowEffectsEnabled: true,
    reducedMotion: false,
};

const HERO_TYPES = [
    { id: 'image' as const, label: 'Image', icon: '🖼️', desc: 'Static hero image' },
    { id: 'video' as const, label: 'Video', icon: '🎬', desc: 'Background video loop' },
    { id: 'shader' as const, label: 'Shader', icon: '🌊', desc: 'Animated WebGL shader' },
    { id: 'particle' as const, label: 'Particle', icon: '✨', desc: 'Floating particles' },
    { id: 'aurora' as const, label: 'Aurora', icon: '🌌', desc: 'Northern lights effect' },
    { id: 'gradient' as const, label: 'Gradient', icon: '🎨', desc: 'Animated gradient' },
];

const HERO_PRESETS: Record<string, { label: string; presets: { id: string; label: string }[] }> = {
    shader: {
        label: 'Shader Presets',
        presets: [
            { id: 'ocean', label: 'Ocean' },
            { id: 'tropical', label: 'Tropical' },
            { id: 'sunset', label: 'Sunset' },
            { id: 'midnight', label: 'Midnight' },
            { id: 'caribbean', label: 'Caribbean' },
        ],
    },
    aurora: {
        label: 'Aurora Presets',
        presets: [
            { id: 'teal', label: 'Teal' },
            { id: 'purple', label: 'Purple' },
            { id: 'ocean', label: 'Ocean' },
            { id: 'sunset', label: 'Sunset' },
            { id: 'emerald', label: 'Emerald' },
            { id: 'midnight', label: 'Midnight' },
        ],
    },
    particle: {
        label: 'Particle Presets',
        presets: [
            { id: 'snow', label: 'Snow' },
            { id: 'stars', label: 'Stars' },
            { id: 'bubbles', label: 'Bubbles' },
            { id: 'confetti', label: 'Confetti' },
        ],
    },
};

function Toggle({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-2xl border border-border-primary">
            <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-ink-primary">{label}</div>
                {description && <p className="text-[10px] text-ink-tertiary mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 ${enabled ? 'bg-teal-500' : 'bg-surface-tertiary'}`}
            >
                <motion.div
                    animate={{ x: enabled ? 24 : 4 }}
                    className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-sm"
                />
            </button>
        </div>
    );
}

function Slider({ value, onChange, min, max, step, label, unit }: {
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step: number;
    label: string;
    unit?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-ink-tertiary uppercase">
                <span>{label}</span>
                <span>{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
            />
        </div>
    );
}

export default function VisualEffectsPanel() {
    const [config, setConfig] = useState<VisualEffectsConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [activeSection, setActiveSection] = useState<'hero' | 'effects' | 'accessibility'>('hero');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/site-settings/visual-effects');
            if (res.data) {
                setConfig({ ...DEFAULT_CONFIG, ...res.data });
            }
        } catch {
            // Use defaults if not set
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/site-settings', {
                setting_key: 'visual_effects',
                setting_value: JSON.stringify(config),
            });
            toast.success('Visual effects saved');
        } catch {
            toast.error('Failed to save visual effects');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setConfig(DEFAULT_CONFIG);
        toast.success('Reset to defaults');
    };

    const updateConfig = (partial: Partial<VisualEffectsConfig>) => {
        setConfig(prev => ({ ...prev, ...partial }));
    };

    if (loading) {
        return <div className="animate-pulse h-48 bg-surface-secondary rounded-2xl" />;
    }

    const currentPresets = HERO_PRESETS[config.heroType]?.presets || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-ink-primary">Visual Effects</h3>
                        <p className="text-[10px] text-ink-tertiary font-bold uppercase tracking-widest">Control hero, particles & animations</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="p-2 rounded-xl bg-surface-secondary border border-border-primary hover:border-teal-500 transition-all" title="Reset to defaults">
                        <RotateCcw size={16} className="text-ink-tertiary" />
                    </button>
                    <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl bg-surface-secondary border border-border-primary hover:border-teal-500 transition-all">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-6 overflow-hidden"
                    >
                        {/* Section Tabs */}
                        <div className="flex gap-1 p-1 bg-surface-secondary rounded-2xl border border-border-primary">
                            {([
                                { id: 'hero' as const, label: 'Hero', icon: <Layers size={14} /> },
                                { id: 'effects' as const, label: 'Effects', icon: <Sparkles size={14} /> },
                                { id: 'accessibility' as const, label: 'Accessibility', icon: <Eye size={14} /> },
                            ]).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === tab.id ? 'bg-surface-elevated shadow-sm text-teal-600' : 'text-ink-tertiary'}`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Hero Section */}
                        {activeSection === 'hero' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-3 block">Hero Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {HERO_TYPES.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => updateConfig({ heroType: type.id })}
                                                className={`p-3 rounded-2xl border-2 transition-all text-left ${config.heroType === type.id
                                                    ? 'border-teal-500 bg-teal-50'
                                                    : 'border-border-primary hover:border-teal-300'
                                                    }`}
                                            >
                                                <div className="text-lg mb-1">{type.icon}</div>
                                                <div className="text-[10px] font-black uppercase tracking-wider">{type.label}</div>
                                                <div className="text-[8px] text-ink-tertiary">{type.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {currentPresets.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-3 block">
                                            {HERO_PRESETS[config.heroType]?.label || 'Presets'}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {currentPresets.map(preset => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => updateConfig({ heroPreset: preset.id })}
                                                    className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${config.heroPreset === preset.id
                                                        ? 'border-teal-500 bg-teal-500 text-white'
                                                        : 'border-border-primary text-ink-tertiary hover:border-teal-300'
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Toggle
                                    enabled={config.kenBurnsEnabled}
                                    onChange={v => updateConfig({ kenBurnsEnabled: v })}
                                    label="Ken Burns Effect"
                                    description="Slow zoom & pan on hero images"
                                />

                                <Toggle
                                    enabled={config.parallaxEnabled}
                                    onChange={v => updateConfig({ parallaxEnabled: v })}
                                    label="Parallax Scrolling"
                                    description="Background moves at different speed"
                                />
                            </div>
                        )}

                        {/* Effects Section */}
                        {activeSection === 'effects' && (
                            <div className="space-y-4">
                                <Toggle
                                    enabled={config.particlesEnabled}
                                    onChange={v => updateConfig({ particlesEnabled: v })}
                                    label="Particle System"
                                    description="Floating animated particles"
                                />

                                {config.particlesEnabled && (
                                    <div className="pl-4 border-l-2 border-teal-200">
                                        <Slider
                                            value={config.particleIntensity}
                                            onChange={v => updateConfig({ particleIntensity: v })}
                                            min={0}
                                            max={10}
                                            step={1}
                                            label="Particle Intensity"
                                        />
                                    </div>
                                )}

                                <Toggle
                                    enabled={config.animationsEnabled}
                                    onChange={v => updateConfig({ animationsEnabled: v })}
                                    label="UI Animations"
                                    description="Page transitions & micro-interactions"
                                />

                                {config.animationsEnabled && (
                                    <div className="pl-4 border-l-2 border-teal-200">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2 block">Animation Speed</label>
                                        <div className="flex gap-2">
                                            {(['slow', 'normal', 'fast'] as const).map(speed => (
                                                <button
                                                    key={speed}
                                                    onClick={() => updateConfig({ animationSpeed: speed })}
                                                    className={`flex-1 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all ${config.animationSpeed === speed
                                                        ? 'border-teal-500 bg-teal-500 text-white'
                                                        : 'border-border-primary text-ink-tertiary hover:border-teal-300'
                                                        }`}
                                                >
                                                    {speed}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Toggle
                                    enabled={config.glowEffectsEnabled}
                                    onChange={v => updateConfig({ glowEffectsEnabled: v })}
                                    label="Glow Effects"
                                    description="Neon glow on buttons & highlights"
                                />
                            </div>
                        )}

                        {/* Accessibility Section */}
                        {activeSection === 'accessibility' && (
                            <div className="space-y-4">
                                <Toggle
                                    enabled={config.reducedMotion}
                                    onChange={v => updateConfig({ reducedMotion: v })}
                                    label="Reduced Motion"
                                    description="Minimize animations for accessibility (WCAG)"
                                />

                                <div className="p-4 bg-surface-secondary rounded-2xl border border-border-primary">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye size={14} className="text-ink-tertiary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Live Preview</span>
                                    </div>
                                    <div className="text-[10px] text-ink-tertiary space-y-1">
                                        <p>• Hero: <span className="font-bold text-ink-primary">{config.heroType}</span> ({config.heroPreset})</p>
                                        <p>• Particles: <span className="font-bold text-ink-primary">{config.particlesEnabled ? `On (intensity ${config.particleIntensity})` : 'Off'}</span></p>
                                        <p>• Animations: <span className="font-bold text-ink-primary">{config.animationsEnabled ? config.animationSpeed : 'Off'}</span></p>
                                        <p>• Ken Burns: <span className="font-bold text-ink-primary">{config.kenBurnsEnabled ? 'On' : 'Off'}</span></p>
                                        <p>• Parallax: <span className="font-bold text-ink-primary">{config.parallaxEnabled ? 'On' : 'Off'}</span></p>
                                        <p>• Glow: <span className="font-bold text-ink-primary">{config.glowEffectsEnabled ? 'On' : 'Off'}</span></p>
                                        <p>• Reduced Motion: <span className="font-bold text-ink-primary">{config.reducedMotion ? 'On' : 'Off'}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Visual Effects'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

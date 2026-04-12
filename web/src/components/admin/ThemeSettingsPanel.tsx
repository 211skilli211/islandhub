'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { setToastStyle, ToastStyle } from '@/lib/toast';

interface ThemeSettingsPanelProps {
    onThemeChange?: (theme: string) => void;
}

export default function ThemeSettingsPanel({ onThemeChange }: ThemeSettingsPanelProps) {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [primaryColor, setPrimaryColor] = useState('#0d9488');
    const [toastStyle, setToastStyleLocal] = useState<ToastStyle>('modern-dark');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThemeSettings();
    }, []);

    const fetchThemeSettings = async () => {
        try {
            const res = await api.get('/site-settings/theme');
            if (res.data.theme) {
                setTheme(res.data.theme);
            }
            if (res.data.primaryColor) {
                setPrimaryColor(res.data.primaryColor);
            }
            if (res.data.toastStyle) {
                setToastStyleLocal(res.data.toastStyle);
            }
        } catch (err) {
            console.error('Failed to fetch theme settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTheme = async () => {
        setSaving(true);
        try {
            await api.put('/site-settings', { setting_key: 'theme', setting_value: theme });
            await api.put('/site-settings', { setting_key: 'primary_color', setting_value: primaryColor });
            await api.put('/site-settings', { setting_key: 'toast_style', setting_value: toastStyle });
            setToastStyle(toastStyle);
            if (onThemeChange) onThemeChange(theme);
        } catch (err) {
            console.error('Failed to save theme');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-48 bg-slate-100 rounded-2xl"></div>;
    }

    const colorPresets = [
        { name: 'Teal', value: '#0d9488' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Cyan', value: '#06b6d4' },
    ];

    const toastStylePresets: { id: ToastStyle; name: string; icon: string; desc: string }[] = [
        { id: 'modern-dark', name: 'Modern Dark', icon: '🌑', desc: 'Glassmorphism with blur' },
        { id: 'clean-light', name: 'Clean Light', icon: '☀️', desc: 'Minimal white styling' },
        { id: 'teal-accent', name: 'Teal Accent', icon: '💚', desc: 'IslandHub brand gradient' },
        { id: 'neumorphic', name: 'Neumorphic', icon: '🔳', desc: 'Soft raised appearance' },
        { id: 'minimal', name: 'Minimal', icon: '⚪', desc: 'Text only, no background' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Site Theme</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Control the default theme for the entire platform</p>
            </div>

            {/* Theme Selection */}
            <div className="grid grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                            theme === t 
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className="text-2xl mb-2">
                            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '⚙️'}
                        </div>
                        <div className="font-bold text-sm capitalize">{t}</div>
                    </button>
                ))}
            </div>

            {/* Primary Color */}
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Primary Color</h4>
                <div className="flex flex-wrap gap-3">
                    {colorPresets.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => setPrimaryColor(color.value)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                                primaryColor === color.value 
                                    ? 'border-slate-900 dark:border-white scale-110' 
                                    : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            {/* Toast Style */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Toast Notifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {toastStylePresets.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => setToastStyleLocal(style.id)}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${
                                toastStyle === style.id
                                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="text-xl mb-1">{style.icon}</div>
                            <div className="font-bold text-xs">{style.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{style.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">Preview</h4>
                <div className="flex gap-3">
                    <div 
                        className="px-4 py-2 rounded-lg text-white font-bold"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Button
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-sm">
                        Toast Style
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSaveTheme}
                disabled={saving}
                className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save Theme Settings'}
            </button>
        </div>
    );
}
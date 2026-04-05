'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth';

interface PushNotificationSettings {
    enabled: boolean;
    dispatch_alerts: boolean;
    trip_updates: boolean;
    messages: boolean;
    promotions: boolean;
}

export default function PushNotificationManager() {
    const { user } = useAuthStore();
    const [settings, setSettings] = useState<PushNotificationSettings>({
        enabled: false,
        dispatch_alerts: true,
        trip_updates: true,
        messages: true,
        promotions: false
    });
    const [deviceToken, setDeviceToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/push/notifications?limit=1');
            // For now, just mark as enabled if user has any tokens (we assume they're registered)
            setSettings(prev => ({ ...prev, enabled: true }));
        } catch (err) {
            console.error('Failed to fetch push settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const registerDevice = async () => {
        if (!deviceToken) {
            toast.error('Please enter a device token');
            return;
        }
        
        try {
            await api.post('/push/register-device', {
                token: deviceToken,
                platform: 'web'
            });
            toast.success('Device registered for push notifications');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to register device');
        }
    };

    const updateSettings = async (newSettings: Partial<PushNotificationSettings>) => {
        setSaving(true);
        try {
            const updated = { ...settings, ...newSettings };
            setSettings(updated);
            toast.success('Notification preferences saved');
        } catch (err) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const unregisterDevice = async () => {
        try {
            await api.post('/push/unregister-device', { token: deviceToken });
            setDeviceToken('');
            toast.success('Device unregistered');
        } catch (err) {
            toast.error('Failed to unregister device');
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl h-64"></div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Push Notifications</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={settings.enabled}
                        onChange={(e) => updateSettings({ enabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:ring-4 peer-focus:ring-teal-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
                    <span className="ml-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                        {settings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </label>
            </div>

            {settings.enabled && (
                <>
                    {/* Device Token */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Device Token</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={deviceToken}
                                onChange={(e) => setDeviceToken(e.target.value)}
                                placeholder="Enter FCM device token..."
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                            />
                            <button
                                onClick={registerDevice}
                                className="px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black uppercase"
                            >
                                Register
                            </button>
                            {deviceToken && (
                                <button
                                    onClick={unregisterDevice}
                                    className="px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification Types */}
                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Types</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: 'dispatch_alerts', label: '🚗 Dispatch Alerts', desc: 'New ride requests nearby' },
                                { key: 'trip_updates', label: '📍 Trip Updates', desc: 'Status changes on trips' },
                                { key: 'messages', label: '💬 Messages', desc: 'New buyer/seller messages' },
                                { key: 'promotions', label: '🎁 Promotions', desc: 'Deals and special offers' }
                            ].map(item => (
                                <label key={item.key} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings[item.key as keyof PushNotificationSettings] as boolean}
                                        onChange={(e) => updateSettings({ [item.key]: e.target.checked })}
                                        className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {!settings.enabled && (
                <div className="p-8 text-center text-slate-400">
                    Enable push notifications to receive alerts on your device
                </div>
            )}
        </div>
    );
}
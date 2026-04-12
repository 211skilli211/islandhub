'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';

export default function AdminSettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [settings, setSettings] = useState<any>({});
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'general' | 'theme' | 'vendor' | 'moderation' | 'export'>('general');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/settings');
                setSettings(res.data);
            } catch (err) {
                console.error('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, [isAuthenticated, user, router]);

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            await api.put('/admin/settings', settings);
        } catch (err) {
            console.error('Failed to save settings');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleExport = async (type: string) => {
        try {
            const res = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}-export.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Configure platform settings and preferences</p>
            </div>
            <AdminSettingsTab
                settings={settings}
                setSettings={setSettings}
                saveSettings={saveSettings}
                savingSettings={savingSettings}
                settingsTab={settingsTab}
                setSettingsTab={setSettingsTab}
                handleExport={handleExport}
            />
        </div>
    );
}
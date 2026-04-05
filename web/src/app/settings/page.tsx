'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';

const ImageUpload = dynamic(
    () => import('@/components/ImageUpload'),
    {
        loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-xl" />,
        ssr: false
    }
);

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'security' | 'connected' | 'appearance' | 'language' | 'vendor';

interface NotificationPrefs {
    email_orders: boolean;
    email_marketing: boolean;
    push_dispatch: boolean;
    push_trips: boolean;
    push_messages: boolean;
    push_promotions: boolean;
}

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [saving, setSaving] = useState(false);
    
    // Account
    const [accountData, setAccountData] = useState({ name: '', bio: '', country: '' });
    const [emailData, setEmailData] = useState({ email: '' });
    const [changingEmail, setChangingEmail] = useState(false);
    
    // Notifications
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
        email_orders: true,
        email_marketing: false,
        push_dispatch: true,
        push_trips: true,
        push_messages: true,
        push_promotions: false
    });
    
    // Security
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showChangePassword, setShowChangePassword] = useState(false);
    
    // Privacy
    const [privacyPrefs, setPrivacyPrefs] = useState({
        profile_public: true,
        show_email: false,
        show_location: true,
        allow_messages: true
    });
    
    // Appearance
    const [appearance, setAppearance] = useState({ theme: 'system', compact: false });
    
    // Language
    const [language, setLanguage] = useState({ locale: 'en', timezone: 'UTC' });
    
    // Vendor
    const [vendorData, setVendorData] = useState({ business_name: '', location: '', description: '', logo_url: '', banner_url: '' });
    
    // Media
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [mediaLoading, setMediaLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setAccountData({ name: user.name || '', bio: (user as any).bio || '', country: (user as any).country || '' });
            setEmailData({ email: (user as any).email || '' });
        }
    }, [user]);

    useEffect(() => {
        if ((user?.role === 'vendor' || user?.role === 'admin') && activeTab === 'vendor') {
            api.get(`/vendors/${user.id}`).then(res => {
                setVendorData({ business_name: res.data.business_name || '', location: res.data.location || '', description: res.data.description || '', logo_url: res.data.logo_url || '', banner_url: res.data.banner_url || '' });
            }).catch(console.error);
        }
        if (activeTab === 'media-library') fetchMedia();
    }, [user, activeTab]);

    const fetchMedia = async () => {
        setMediaLoading(true);
        try {
            const res = await api.get('/uploads');
            setMediaItems(res.data.media || []);
        } catch (err) { console.error(err); }
        finally { setMediaLoading(false); }
    };

    const handleSaveAccount = async () => {
        setSaving(true);
        try {
            await api.put('/users/profile', accountData);
            if (user) useAuthStore.getState().setUser({ ...user, ...accountData });
            toast.success('Account updated');
        } catch { toast.error('Failed to update'); }
        setSaving(false);
    };

    const handleChangeEmail = async () => {
        if (!emailData.email) return toast.error('Email required');
        setSaving(true);
        try {
            await api.post('/users/change-email', { email: emailData.email });
            toast.success('Verification email sent');
            setChangingEmail(false);
        } catch { toast.error('Failed to send verification'); }
        setSaving(false);
    };

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) return toast.error('Passwords do not match');
        if (passwordData.new.length < 8) return toast.error('Password must be 8+ characters');
        setSaving(true);
        try {
            await api.post('/users/change-password', { current_password: passwordData.current, new_password: passwordData.new });
            toast.success('Password changed');
            setPasswordData({ current: '', new: '', confirm: '' });
            setShowChangePassword(false);
        } catch { toast.error('Failed to change password'); }
        setSaving(false);
    };

    const handleSaveNotifPrefs = async () => {
        setSaving(true);
        try {
            await api.put('/users/preferences', { notifications: notifPrefs, privacy: privacyPrefs });
            toast.success('Preferences saved');
        } catch { toast.error('Failed to save'); }
        setSaving(false);
    };

    const handleSaveVendor = async () => {
        setSaving(true);
        try {
            await api.post('/vendors', vendorData);
            toast.success('Vendor settings saved');
        } catch { toast.error('Failed to save vendor settings'); }
        setSaving(false);
    };

    const tabs: { id: SettingsTab; label: string; icon: string }[] = [
        { id: 'account', label: 'Account', icon: '👤' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'privacy', label: 'Privacy', icon: '🔒' },
        { id: 'security', label: 'Security', icon: '🛡️' },
        { id: 'connected', label: 'Connected', icon: '🔗' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        { id: 'language', label: 'Language', icon: '🌐' },
        ...(user?.role === 'vendor' || user?.role === 'admin' ? [{ id: 'vendor' as SettingsTab, label: 'Vendor', icon: '🏪' }] : []),
    ];

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-slate-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your account and preferences</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-100 p-4 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-teal-50 text-teal-700' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                
                                {/* ACCOUNT */}
                                {activeTab === 'account' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Account Settings</h2>
                                            <p className="text-sm text-slate-500">Your personal information</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                                                <input value={accountData.name} onChange={e => setAccountData({ ...accountData, name: e.target.value })} 
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                                                <textarea value={accountData.bio} onChange={e => setAccountData({ ...accountData, bio: e.target.value })} rows={3}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                                                <input value={accountData.country} onChange={e => setAccountData({ ...accountData, country: e.target.value })} 
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100">
                                            <h3 className="font-bold text-slate-900 mb-4">Email Address</h3>
                                            {changingEmail ? (
                                                <div className="flex gap-3">
                                                    <input value={emailData.email} onChange={e => setEmailData({ ...emailData, email: e.target.value })} placeholder="new@email.com"
                                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium" />
                                                    <button onClick={handleChangeEmail} disabled={saving} className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold text-sm">Verify</button>
                                                    <button onClick={() => setChangingEmail(false)} className="px-4 py-3 text-slate-500">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-700">{(user as any)?.email || 'No email'}</span>
                                                    <button onClick={() => setChangingEmail(true)} className="text-teal-600 font-bold text-sm hover:underline">Change</button>
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={handleSaveAccount} disabled={saving} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}

                                {/* NOTIFICATIONS */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Notifications</h2>
                                            <p className="text-sm text-slate-500">How you want to be contacted</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 rounded-3xl">
                                                <h3 className="font-bold text-slate-900 mb-4">📧 Email Notifications</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'email_orders', label: 'Order Updates', desc: 'Status changes on your orders' },
                                                        { key: 'email_marketing', label: 'Marketing', desc: 'Deals and special offers' }
                                                    ].map(item => (
                                                        <div key={item.key} className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-slate-900">{item.label}</div>
                                                                <div className="text-xs text-slate-500">{item.desc}</div>
                                                            </div>
                                                            <Toggle checked={notifPrefs[item.key as keyof NotificationPrefs]} onChange={(v: boolean) => setNotifPrefs({ ...notifPrefs, [item.key]: v })} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-50 rounded-3xl">
                                                <h3 className="font-bold text-slate-900 mb-4">🔔 Push Notifications</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'push_dispatch', label: '🚗 Dispatch Alerts', desc: 'New ride requests' },
                                                        { key: 'push_trips', label: '📍 Trip Updates', desc: 'Trip status changes' },
                                                        { key: 'push_messages', label: '💬 Messages', desc: 'New messages' },
                                                        { key: 'push_promotions', label: '🎁 Promotions', desc: 'Special offers' }
                                                    ].map(item => (
                                                        <div key={item.key} className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-slate-900">{item.label}</div>
                                                                <div className="text-xs text-slate-500">{item.desc}</div>
                                                            </div>
                                                            <Toggle checked={notifPrefs[item.key as keyof NotificationPrefs]} onChange={(v: boolean) => setNotifPrefs({ ...notifPrefs, [item.key]: v })} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-6">
                                            <h3 className="font-bold text-slate-900 mb-4">📱 Device Registration</h3>
                                            <PushNotificationManager />
                                        </div>

                                        <button onClick={handleSaveNotifPrefs} disabled={saving} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </div>
                                )}

                                {/* PRIVACY */}
                                {activeTab === 'privacy' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Privacy Settings</h2>
                                            <p className="text-sm text-slate-500">Control who sees your information</p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'profile_public', label: 'Public Profile', desc: 'Allow others to view your profile' },
                                                { key: 'show_email', label: 'Show Email', desc: 'Display your email on your profile' },
                                                { key: 'show_location', label: 'Show Location', desc: 'Display your location to others' },
                                                { key: 'allow_messages', label: 'Allow Messages', desc: 'Let others send you messages' }
                                            ].map(item => (
                                                <div key={item.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                                    <div>
                                                        <div className="font-bold text-slate-900">{item.label}</div>
                                                        <div className="text-xs text-slate-500">{item.desc}</div>
                                                    </div>
                                                    <Toggle checked={privacyPrefs[item.key as keyof typeof privacyPrefs]} onChange={(v: boolean) => setPrivacyPrefs({ ...privacyPrefs, [item.key]: v })} />
                                                </div>
                                            ))}
                                        </div>

                                        <button onClick={handleSaveNotifPrefs} disabled={saving} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Privacy Settings'}
                                        </button>
                                    </div>
                                )}

                                {/* SECURITY */}
                                {activeTab === 'security' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Security</h2>
                                            <p className="text-sm text-slate-500">Protect your account</p>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-slate-900">🔑 Password</h3>
                                                <button onClick={() => setShowChangePassword(!showChangePassword)} className="text-teal-600 font-bold text-sm">
                                                    {showChangePassword ? 'Cancel' : 'Change'}
                                                </button>
                                            </div>
                                            
                                            {showChangePassword && (
                                                <div className="space-y-4 mt-6">
                                                    <input type="password" placeholder="Current password" value={passwordData.current} onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" />
                                                    <input type="password" placeholder="New password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" />
                                                    <input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" />
                                                    <button onClick={handleChangePassword} disabled={saving} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold">
                                                        {saving ? 'Changing...' : 'Update Password'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <h3 className="font-bold text-slate-900 mb-4">🔐 Two-Factor Authentication</h3>
                                            <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account</p>
                                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50">
                                                Enable 2FA
                                            </button>
                                        </div>

                                        <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                                            <h3 className="font-bold text-rose-900 mb-2">⚠️ Danger Zone</h3>
                                            <p className="text-sm text-rose-800 mb-4">Permanently delete your account and all data</p>
                                            <button className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CONNECTED */}
                                {activeTab === 'connected' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Connected Accounts</h2>
                                            <p className="text-sm text-slate-500">Link accounts for easier login</p>
                                        </div>

                                        <div className="space-y-4">
                                            {['Google', 'Facebook', 'Apple'].map(provider => (
                                                <div key={provider} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg">🔗</div>
                                                        <span className="font-bold text-slate-900">{provider}</span>
                                                    </div>
                                                    <button className="px-4 py-2 text-teal-600 font-bold text-sm">Connect</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* APPEARANCE */}
                                {activeTab === 'appearance' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Appearance</h2>
                                            <p className="text-sm text-slate-500">Customize how IslandHub looks</p>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <h3 className="font-bold text-slate-900 mb-4">Theme</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['light', 'dark', 'system'].map(theme => (
                                                    <button key={theme} onClick={() => setAppearance({ ...appearance, theme })}
                                                        className={`p-4 rounded-2xl font-bold text-sm capitalize transition-all ${
                                                            appearance.theme === theme ? 'bg-teal-600 text-white' : 'bg-white text-slate-700'
                                                        }`}>
                                                        {theme}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                            <div>
                                                <div className="font-bold text-slate-900">Compact Mode</div>
                                                <div className="text-xs text-slate-500">Use less spacing throughout the UI</div>
                                            </div>
                                            <Toggle checked={appearance.compact} onChange={(v: boolean) => setAppearance({ ...appearance, compact: v })} />
                                        </div>
                                    </div>
                                )}

                                {/* LANGUAGE */}
                                {activeTab === 'language' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Language & Region</h2>
                                            <p className="text-sm text-slate-500">Set your language and timezone</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Language</label>
                                                <select value={language.locale} onChange={e => setLanguage({ ...language, locale: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium">
                                                    <option value="en">English</option>
                                                    <option value="es">Español</option>
                                                    <option value="fr">Français</option>
                                                    <option value="de">Deutsch</option>
                                                    <option value="zh">中文</option>
                                                    <option value="ja">日本語</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Timezone</label>
                                                <select value={language.timezone} onChange={e => setLanguage({ ...language, timezone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium">
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York">Eastern Time</option>
                                                    <option value="America/Los_Angeles">Pacific Time</option>
                                                    <option value="Europe/London">London</option>
                                                    <option value="Asia/Tokyo">Tokyo</option>
                                                    <option value="Asia/Shanghai">Shanghai</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* VENDOR */}
                                {activeTab === 'vendor' && user?.role !== 'user' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Vendor Settings</h2>
                                            <p className="text-sm text-slate-500">Manage your store settings</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ImageUpload type="avatar" label="Store Logo" currentImage={vendorData.logo_url ? getImageUrl(vendorData.logo_url) : undefined} onUpload={(url) => setVendorData(prev => ({ ...prev, logo_url: url }))} />
                                            <ImageUpload type="banner" label="Store Banner" currentImage={vendorData.banner_url ? getImageUrl(vendorData.banner_url) : undefined} onUpload={(url) => setVendorData(prev => ({ ...prev, banner_url: url }))} aspectRatio="16:9" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
                                                <input value={vendorData.business_name} onChange={e => setVendorData({ ...vendorData, business_name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                                                <input value={vendorData.location} onChange={e => setVendorData({ ...vendorData, location: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Store Description</label>
                                            <textarea value={vendorData.description} onChange={e => setVendorData({ ...vendorData, description: e.target.value })} rows={4}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium" />
                                        </div>

                                        <button onClick={handleSaveVendor} disabled={saving} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Vendor Settings'}
                                        </button>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
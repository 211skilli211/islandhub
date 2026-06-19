'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api, { getImageUrl } from '@/lib/api';
import toast from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const ImageUpload = dynamic(
    () => import('@/components/ImageUpload'),
    {
        loading: () => <div className="h-32 bg-surface-secondary animate-pulse rounded-xl" />,
        ssr: false
    }
);

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'security' | 'connected' | 'appearance' | 'language' | 'vendor' | 'media-library';

interface NotificationPrefs {
    email_orders: boolean;
    email_marketing: boolean;
    push_dispatch: boolean;
    push_trips: boolean;
    push_messages: boolean;
    push_promotions: boolean;
    ai_auto_reply: boolean;
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<SettingsTab>(
        tabParam === 'notifications' || tabParam === 'privacy' || tabParam === 'security' || 
        tabParam === 'connected' || tabParam === 'appearance' || tabParam === 'language' || 
        tabParam === 'vendor' || tabParam === 'media-library' 
            ? tabParam as SettingsTab 
            : 'account'
    );
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['notifications', 'privacy', 'security', 'connected', 'appearance', 'language', 'vendor', 'media-library'].includes(tab)) {
            setActiveTab(tab as SettingsTab);
        } else if (!tab) {
            setActiveTab('account');
        }
    }, [searchParams]);
    
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
        push_promotions: false,
        ai_auto_reply: false
    });
    
    // Security
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFASecret, setTwoFASecret] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [twoFAMethod, setTwoFAMethod] = useState<'authenticator' | 'email'>('authenticator');
    const [show2FAMethodSelect, setShow2FAMethodSelect] = useState(false);
    
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

    const handleDeleteMedia = async (filename: string) => {
        if (!confirm('Delete this file?')) return;
        try {
            await api.delete(`/uploads/${filename}`);
            setMediaItems(prev => prev.filter((item: any) => item.filename !== filename));
            toast.success('File deleted');
        } catch { toast.error('Failed to delete'); }
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

    const handleDeleteAccount = async () => {
        if (!deletePassword) return toast.error('Password required');
        if (!confirm('Are you sure? This cannot be undone!')) return;
        setSaving(true);
        try {
            await api.delete('/users/delete-account', { data: { password: deletePassword } });
            toast.success('Account deleted');
            // Redirect to home or logout
            window.location.href = '/';
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete account');
        }
        setSaving(false);
    };

    const handleEnable2FA = async () => {
        // If 2FA not enabled yet, show method selection first
        if (!twoFAEnabled && !show2FASetup) {
            setShow2FAMethodSelect(true);
            return;
        }
        
        setSaving(true);
        try {
            const res = await api.post('/users/2fa/enable', { method: twoFAMethod });
            if (res.data.method === 'email') {
                setShow2FASetup(true);
                toast.success('Verification code sent to your email');
            } else {
                setTwoFASecret(res.data.secret);
                setShow2FASetup(true);
                toast.success('2FA setup initiated - scan QR code');
            }
        } catch { toast.error('Failed to enable 2FA'); }
        setSaving(false);
    };

    const handleVerify2FA = async () => {
        if (!twoFACode || twoFACode.length !== 6) return toast.error('Enter 6-digit code');
        setSaving(true);
        try {
            const res = await api.post('/users/2fa/verify', { code: twoFACode });
            setTwoFAEnabled(true);
            setTwoFAMethod(res.data.method);
            setShow2FASetup(false);
            setShow2FAMethodSelect(false);
            toast.success('2FA enabled! Save your backup codes: ' + (res.data.backupCodes?.join(', ') || 'N/A'));
        } catch { toast.error('Invalid code'); }
        setSaving(false);
    };

    const handleDisable2FA = async () => {
        if (!confirm('Disable 2FA?')) return;
        setSaving(true);
        try {
            await api.post('/users/2fa/disable', { password: passwordData.current, code: twoFACode });
            setTwoFAEnabled(false);
            toast.success('2FA disabled');
        } catch { toast.error('Failed to disable 2FA'); }
        setSaving(false);
    };

    const handleToggleAutoReply = async () => {
        setSaving(true);
        try {
            const updated = { ...notifPrefs, ai_auto_reply: !notifPrefs.ai_auto_reply };
            await api.put('/users/preferences', { notifications: updated });
            setNotifPrefs(updated);
            toast.success(updated.ai_auto_reply ? 'AI Auto-Reply enabled' : 'AI Auto-Reply disabled');
        } catch { toast.error('Failed to update'); }
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
        { id: 'media-library', label: 'Media Library', icon: '🖼️' },
        ...(user?.role === 'vendor' || user?.role === 'admin' ? [{ id: 'vendor' as SettingsTab, label: 'Vendor', icon: '🏪' }] : []),
    ];

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-accent-500' : 'bg-surface-tertiary'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-surface-elevated transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="py-6 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-ink-primary dark:text-white">Settings</h1>
                    <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-1">Manage your account and preferences</p>
                </div>

                <div className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl shadow-sm border border-border-primary dark:border-border-primary p-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                
                                
                                {activeTab === 'account' && (
                                    <div className="space-y-6 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Account Settings</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary dark:text-ink-tertiary">Your personal information</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary dark:text-ink-tertiary mb-2">Display Name</label>
                                                <input value={accountData.name} onChange={e => setAccountData({ ...accountData, name: e.target.value })} 
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary dark:text-ink-tertiary mb-2">Bio</label>
                                                <textarea value={accountData.bio} onChange={e => setAccountData({ ...accountData, bio: e.target.value })} rows={3}
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary dark:text-ink-tertiary mb-2">Country</label>
                                                <input value={accountData.country} onChange={e => setAccountData({ ...accountData, country: e.target.value })} 
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-accent-400" />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border-primary dark:border-border-primary">
                                            <h3 className="font-bold text-ink-primary dark:text-white mb-4">Email Address</h3>
                                            {changingEmail ? (
                                                <div className="flex gap-3">
                                                    <input value={emailData.email} onChange={e => setEmailData({ ...emailData, email: e.target.value })} placeholder="new@email.com"
                                                        className="flex-1 px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white placeholder-ink-400 dark:placeholder-ink-500" />
                                                    <button onClick={handleChangeEmail} disabled={saving} className="px-6 py-3 bg-accent-500 text-white rounded-2xl font-bold text-sm">Verify</button>
                                                    <button onClick={() => setChangingEmail(false)} className="px-4 py-3 text-ink-tertiary dark:text-ink-tertiary dark:text-ink-tertiary">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-ink-secondary dark:text-ink-tertiary dark:text-ink-tertiary">{(user as any)?.email || 'No email'}</span>
                                                    <button onClick={() => setChangingEmail(true)} className="text-accent-400 font-bold text-sm hover:underline">Change</button>
                                                </div>
                                            )}
                                        </div>

                                        <button onClick={handleSaveAccount} disabled={saving} className="px-8 py-4 bg-surface-tertiary dark:bg-accent-500 text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}

                                
                                {activeTab === 'notifications' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Notifications</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">How you want to be contacted</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 bg-surface-primary dark:bg-surface-tertiary rounded-3xl">
                                                <h3 className="font-bold text-ink-primary dark:text-white mb-4"><EmojiIcon emoji="📧" size=16 /> Email Notifications</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'email_orders', label: 'Order Updates', desc: 'Status changes on your orders' },
                                                        { key: 'email_marketing', label: 'Marketing', desc: 'Deals and special offers' }
                                                    ].map(item => (
                                                        <div key={item.key} className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-ink-primary dark:text-white">{item.label}</div>
                                                                <div className="text-xs text-ink-tertiary dark:text-ink-tertiary">{item.desc}</div>
                                                            </div>
                                                            <Toggle checked={notifPrefs[item.key as keyof NotificationPrefs]} onChange={(v: boolean) => setNotifPrefs({ ...notifPrefs, [item.key]: v })} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-surface-primary dark:bg-surface-tertiary rounded-3xl">
                                                <h3 className="font-bold text-ink-primary dark:text-white mb-4"><EmojiIcon emoji="🔔" size=16 /> Push Notifications</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'push_dispatch', label: '🚗 Dispatch Alerts', desc: 'New ride requests' },
                                                        { key: 'push_trips', label: '📍 Trip Updates', desc: 'Trip status changes' },
                                                        { key: 'push_messages', label: '💬 Messages', desc: 'New messages' },
                                                        { key: 'push_promotions', label: '🎁 Promotions', desc: 'Special offers' }
                                                    ].map(item => (
                                                        <div key={item.key} className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-ink-primary dark:text-white">{item.label}</div>
                                                                <div className="text-xs text-ink-tertiary dark:text-ink-tertiary">{item.desc}</div>
                                                            </div>
                                                            <Toggle checked={notifPrefs[item.key as keyof NotificationPrefs]} onChange={(v: boolean) => setNotifPrefs({ ...notifPrefs, [item.key]: v })} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl border border-teal-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-ink-primary dark:text-white"><EmojiIcon emoji="🤖" size=16 /> AI Auto-Reply</h3>
                                                        <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Automatically respond to buyer messages using AI</p>
                                                    </div>
                                                    <Toggle checked={notifPrefs.ai_auto_reply} onChange={handleToggleAutoReply} />
                                                </div>
                                                {notifPrefs.ai_auto_reply && (
                                                    <EmojiIcon emoji="✓" size=16 className="text-xs text-accent-400 mt-3" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-border-primary pt-6">
                                            <h3 className="font-bold text-ink-primary dark:text-white mb-4"><EmojiIcon emoji="📱" size=16 /> Device Registration</h3>
                                            <PushNotificationManager />
                                        </div>

                                        <button onClick={handleSaveNotifPrefs} disabled={saving} className="px-8 py-4 bg-surface-tertiary text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </div>
                                )}

                                
                                {activeTab === 'privacy' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Privacy Settings</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Control who sees your information</p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'profile_public', label: 'Public Profile', desc: 'Allow others to view your profile' },
                                                { key: 'show_email', label: 'Show Email', desc: 'Display your email on your profile' },
                                                { key: 'show_location', label: 'Show Location', desc: 'Display your location to others' },
                                                { key: 'allow_messages', label: 'Allow Messages', desc: 'Let others send you messages' }
                                            ].map(item => (
                                                <div key={item.key} className="flex items-center justify-between p-6 bg-surface-primary dark:bg-surface-tertiary rounded-2xl">
                                                    <div>
                                                        <div className="font-bold text-ink-primary dark:text-white">{item.label}</div>
                                                        <div className="text-xs text-ink-tertiary dark:text-ink-tertiary">{item.desc}</div>
                                                    </div>
                                                    <Toggle checked={privacyPrefs[item.key as keyof typeof privacyPrefs]} onChange={(v: boolean) => setPrivacyPrefs({ ...privacyPrefs, [item.key]: v })} />
                                                </div>
                                            ))}
                                        </div>

                                        <button onClick={handleSaveNotifPrefs} disabled={saving} className="px-8 py-4 bg-surface-tertiary text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Privacy Settings'}
                                        </button>
                                    </div>
                                )}

                                
                                {activeTab === 'security' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Security</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Protect your account</p>
                                        </div>

                                        <div className="p-6 bg-surface-primary dark:bg-surface-tertiary rounded-3xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-ink-primary dark:text-white"><EmojiIcon emoji="🔑" size=16 /> Password</h3>
                                                <button onClick={() => setShowChangePassword(!showChangePassword)} className="text-accent-400 font-bold text-sm">
                                                    {showChangePassword ? 'Cancel' : 'Change'}
                                                </button>
                                            </div>
                                            
                                            {showChangePassword && (
                                                <div className="space-y-4 mt-6">
                                                    <input type="password" placeholder="Current password" value={passwordData.current} onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 rounded-xl" />
                                                    <input type="password" placeholder="New password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 rounded-xl" />
                                                    <input type="password" placeholder="Confirm new password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 rounded-xl" />
                                                    <button onClick={handleChangePassword} disabled={saving} className="w-full py-3 bg-accent-500 text-white rounded-xl font-bold">
                                                        {saving ? 'Changing...' : 'Update Password'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 bg-surface-primary dark:bg-surface-tertiary rounded-3xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-ink-primary dark:text-white"><EmojiIcon emoji="🔐" size=16 /> Two-Factor Authentication</h3>
                                                {twoFAEnabled && <EmojiIcon emoji="✓" size=16 className="text-accent-400 text-xs font-bold" />}
                                            </div>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mb-4">Add an extra layer of security to your account</p>
                                            
                                            {show2FAMethodSelect && !show2FASetup && (
                                                <div className="space-y-4">
                                                    <p className="text-sm font-medium text-ink-secondary dark:text-ink-tertiary">Choose 2FA method:</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <button 
                                                            onClick={() => { setTwoFAMethod('authenticator'); setShow2FAMethodSelect(false); handleEnable2FA(); }}
                                                            className="p-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 rounded-xl text-left hover:border-teal-500 transition-colors"
                                                        >
                                                            <EmojiIcon emoji="📱" size=16 className="font-bold text-ink-primary dark:text-white" />
                                                            <div className="text-xs text-ink-tertiary dark:text-ink-tertiary mt-1">Google Auth, Authy, etc.</div>
                                                        </button>
                                                        <button 
                                                            onClick={() => { setTwoFAMethod('email'); setShow2FAMethodSelect(false); handleEnable2FA(); }}
                                                            className="p-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 rounded-xl text-left hover:border-teal-500 transition-colors"
                                                        >
                                                            <EmojiIcon emoji="📧" size=16 className="font-bold text-ink-primary dark:text-white" />
                                                            <div className="text-xs text-ink-tertiary dark:text-ink-tertiary mt-1">Receive code via email</div>
                                                        </button>
                                                    </div>
                                                    <button onClick={() => setShow2FAMethodSelect(false)} className="text-sm text-ink-tertiary dark:text-ink-tertiary">Cancel</button>
                                                </div>
                                            )}

                                            {show2FASetup ? (
                                                <div className="space-y-4">
                                                    {twoFAMethod === 'authenticator' && twoFASecret && (
                                                        <div className="p-4 bg-surface-elevated rounded-xl">
                                                            <p className="text-xs font-bold text-ink-tertiary dark:text-ink-tertiary mb-2">Secret Key:</p>
                                                            <code className="text-sm font-mono bg-surface-secondary p-2 rounded block">{twoFASecret}</code>
                                                        </div>
                                                    )}
                                                    {twoFAMethod === 'email' && (
                                                        <div className="p-4 bg-surface-elevated rounded-xl text-center">
                                                            <p className="text-sm text-ink-secondary">Enter the 6-digit code sent to your email</p>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="text" 
                                                        value={twoFACode} 
                                                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        placeholder="Enter 6-digit code"
                                                        className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 rounded-xl text-center font-mono text-lg tracking-widest"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button onClick={handleVerify2FA} disabled={saving} className="flex-1 py-3 bg-accent-500 text-white rounded-xl font-bold">
                                                            {saving ? 'Verifying...' : 'Verify & Enable'}
                                                        </button>
                                                        <button onClick={() => { setShow2FASetup(false); setTwoFACode(''); }} className="px-4 py-3 text-ink-tertiary dark:text-ink-tertiary">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : twoFAEnabled ? (
                                                <div className="flex gap-3">
                                                    <button onClick={handleDisable2FA} className="px-6 py-3 bg-[#e11d48]/10 text-[#be123c] rounded-xl font-bold text-sm">
                                                        Disable 2FA
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={handleEnable2FA} disabled={saving} className="px-6 py-3 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary0 text-ink-secondary dark:text-ink-tertiary rounded-xl font-bold text-sm hover:bg-surface-primary dark:hover:bg-surface-primary0">
                                                    Enable 2FA
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-6 bg-[#e11d48]/5 rounded-3xl border border-[#e11d48]/20">
                                            <h3 className="font-bold text-rose-900 mb-2"><EmojiIcon emoji="⚠️" size=16 /> Danger Zone</h3>
                                            <p className="text-sm text-rose-800 mb-4">Permanently delete your account and all data</p>
                                            
                                            {showDeleteAccount ? (
                                                <div className="space-y-4">
                                                    <input 
                                                        type="password" 
                                                        value={deletePassword} 
                                                        onChange={(e) => setDeletePassword(e.target.value)}
                                                        placeholder="Enter your password to confirm"
                                                        className="w-full px-4 py-3 bg-surface-elevated dark:bg-surface-tertiary border border-[#e11d48]/20 dark:border-[#e11d48] rounded-xl"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button onClick={handleDeleteAccount} disabled={saving || !deletePassword} className="px-6 py-3 bg-[#e11d48] text-white rounded-xl font-bold text-sm">
                                                            {saving ? 'Deleting...' : 'Confirm Delete'}
                                                        </button>
                                                        <button onClick={() => { setShowDeleteAccount(false); setDeletePassword(''); }} className="px-4 py-3 text-ink-tertiary dark:text-ink-tertiary">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setShowDeleteAccount(true)} className="px-6 py-3 bg-[#e11d48] text-white rounded-xl font-bold text-sm hover:bg-[#be123c]">
                                                    Delete Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                
                                {activeTab === 'connected' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Connected Accounts</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Link accounts for easier login</p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { provider: 'Google', icon: '🔵', comingSoon: true },
                                                { provider: 'Facebook', icon: '🔷', comingSoon: true },
                                                { provider: 'Apple', icon: '🍎', comingSoon: true }
                                            ].map(item => (
                                                <div key={item.provider} className="flex items-center justify-between p-6 bg-surface-primary dark:bg-surface-tertiary rounded-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-surface-elevated rounded-xl flex items-center justify-center text-lg">{item.icon}</div>
                                                        <span className="font-bold text-ink-primary dark:text-white">{item.provider}</span>
                                                        {item.comingSoon && (
                                                            <span className="px-2 py-1 bg-sand-500/10 text-sand-500 text-[10px] font-bold rounded-full">Coming Soon</span>
                                                        )}
                                                    </div>
                                                    {item.comingSoon ? (
                                                        <button disabled className="px-4 py-2 text-ink-tertiary font-bold text-sm cursor-not-allowed">Connect</button>
                                                    ) : (
                                                        <button className="px-4 py-2 text-accent-400 font-bold text-sm">Connect</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="p-6 bg-surface-primary dark:bg-surface-tertiary rounded-2xl">
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">
                                                Social login integration requires OAuth credentials setup. Contact support for configuration assistance.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                
                                {activeTab === 'appearance' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Appearance</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Customize how IslandHub looks</p>
                                        </div>

                                        <div className="p-6 bg-surface-primary dark:bg-surface-tertiary rounded-3xl">
                                            <h3 className="font-bold text-ink-primary dark:text-white mb-4">Theme</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['light', 'dark', 'system'].map(theme => (
                                                    <button key={theme} onClick={() => setAppearance({ ...appearance, theme })}
                                                        className={`p-4 rounded-2xl font-bold text-sm capitalize transition-all ${
                                                            appearance.theme === theme ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-ink-secondary dark:text-ink-tertiary'
                                                        }`}>
                                                        {theme}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-surface-primary rounded-2xl">
                                            <div>
                                                <div className="font-bold text-ink-primary dark:text-white">Compact Mode</div>
                                                <div className="text-xs text-ink-tertiary dark:text-ink-tertiary">Use less spacing throughout the UI</div>
                                            </div>
                                            <Toggle checked={appearance.compact} onChange={(v: boolean) => setAppearance({ ...appearance, compact: v })} />
                                        </div>
                                    </div>
                                )}

                                
                                {activeTab === 'language' && (
                                    <div className="space-y-8 max-w-2xl">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Language & Region</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Set your language and timezone</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-2">Language</label>
                                                <select value={language.locale} onChange={e => setLanguage({ ...language, locale: e.target.value })}
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white">
                                                    <option value="en">English</option>
                                                    <option value="es">Español</option>
                                                    <option value="fr">Français</option>
                                                    <option value="de">Deutsch</option>
                                                    <option value="zh">中文</option>
                                                    <option value="ja">日本語</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-2">Timezone</label>
                                                <select value={language.timezone} onChange={e => setLanguage({ ...language, timezone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white">
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

                                
                                {activeTab === 'vendor' && user?.role !== 'user' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Vendor Settings</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Manage your store settings</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ImageUpload type="avatar" label="Store Logo" currentImage={vendorData.logo_url ? getImageUrl(vendorData.logo_url) : undefined} onUpload={(url) => setVendorData(prev => ({ ...prev, logo_url: url }))} />
                                            <ImageUpload type="banner" label="Store Banner" currentImage={vendorData.banner_url ? getImageUrl(vendorData.banner_url) : undefined} onUpload={(url) => setVendorData(prev => ({ ...prev, banner_url: url }))} aspectRatio="16:9" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-2">Business Name</label>
                                                <input value={vendorData.business_name} onChange={e => setVendorData({ ...vendorData, business_name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-2">Location</label>
                                                <input value={vendorData.location} onChange={e => setVendorData({ ...vendorData, location: e.target.value })}
                                                    className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-ink-secondary dark:text-ink-tertiary mb-2">Store Description</label>
                                            <textarea value={vendorData.description} onChange={e => setVendorData({ ...vendorData, description: e.target.value })} rows={4}
                                                className="w-full px-4 py-3 bg-surface-primary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl font-medium text-ink-primary dark:text-white" />
                                        </div>

                                        <button onClick={handleSaveVendor} disabled={saving} className="px-8 py-4 bg-surface-tertiary text-white rounded-2xl font-bold text-sm">
                                            {saving ? 'Saving...' : 'Save Vendor Settings'}
                                        </button>
                                    </div>
                                )}

                                
                                {activeTab === 'media-library' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-black text-ink-primary dark:text-white">Media Library</h2>
                                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">Manage your uploaded images and files</p>
                                        </div>

                                        {mediaLoading ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[...Array(8)].map((_, i) => (
                                                    <div key={i} className="aspect-square bg-surface-secondary animate-pulse rounded-xl" />
                                                ))}
                                            </div>
                                        ) : mediaItems.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {mediaItems.map((item: any, idx: number) => (
                                                    <div key={idx} className="relative group aspect-square bg-surface-secondary rounded-xl overflow-hidden">
                                                        <img src={item.url || getImageUrl(item.filename)} alt={item.filename} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button onClick={() => handleDeleteMedia(item.filename)} className="p-2 bg-[#e11d48] text-white rounded-lg text-xs font-bold">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-ink-tertiary">
                                                No media uploaded yet
                                            </div>
                                        )}
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-ink-tertiary dark:text-ink-tertiary">Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    );
}

export default SettingsPage;
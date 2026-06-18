'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import api, { getImageUrl } from '@/lib/api';
import toast from '@/lib/toast';
import { Camera, MapPin, Link as LinkIcon, Phone, Save, ArrowLeft, Mail, Calendar, Shield, Bell, Lock, Trash2 } from 'lucide-react';

function ProfilePageContent() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<'info' | 'photos' | 'contact' | 'security' | 'preferences'>('info');
    
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: '',
        location: '',
        website: '',
        banner_color: '#0d9488',
    });
    
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/users/${user?.id}`);
            const data = res.data;
            setFormData({
                name: data.name || '',
                bio: data.bio || '',
                phone: data.phone || '',
                location: data.location || '',
                website: data.website || '',
                banner_color: data.banner_color || '#0d9488',
            });
            setProfilePhoto(data.profile_photo_url);
            setBannerImage(data.banner_image_url);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setLoading(true);
        const endpoint = type === 'profile' ? '/uploads/profile-photo' : '/uploads/banner-image';

        try {
            const res = await api.post(endpoint, uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (type === 'profile') {
                setProfilePhoto(res.data.url);
                if (user) setUser({ ...user, avatar_url: res.data.avatar_url || res.data.url });
            } else {
                setBannerImage(res.data.url);
            }
            toast.success(`${type === 'profile' ? 'Profile photo' : 'Banner'} updated!`);
        } catch {
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put('/users/update', formData);
            toast.success('Profile updated!');
            if (user) setUser({ ...user, ...res.data, name: res.data.name || user.name });
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return;
        try {
            await api.delete('/users/delete-account', { data: { password: '' } });
            toast.success('Account deactivated');
            router.push('/');
        } catch {
            toast.error('Failed to deactivate account');
        }
    };

    if (!user) return null;

    const sections = [
        { id: 'info' as const, label: 'Profile Info', icon: <Shield size={18} /> },
        { id: 'photos' as const, label: 'Photos', icon: <Camera size={18} /> },
        { id: 'contact' as const, label: 'Contact', icon: <Phone size={18} /> },
        { id: 'security' as const, label: 'Security', icon: <Lock size={18} /> },
        { id: 'preferences' as const, label: 'Preferences', icon: <Bell size={18} /> },
    ];

    const inputClass = "w-full px-4 py-3 rounded-xl border border-border-primary bg-surface-elevated text-ink-primary font-medium focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all text-sm";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-1.5 block";

    return (
        <div className="min-h-screen bg-surface-primary">
            
            <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden" style={{ backgroundColor: formData.banner_color }}>
                {bannerImage && (
                    <img src={getImageUrl(bannerImage)} alt="Banner" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 p-2 bg-surface-elevated/20 backdrop-blur-md rounded-full text-white hover:bg-surface-elevated/30 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <label className="absolute top-4 right-4 p-2 bg-surface-elevated/20 backdrop-blur-md rounded-full text-white hover:bg-surface-elevated/30 transition-colors cursor-pointer">
                    <Camera size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
                </label>
            </div>

            
            <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
                    <div className="relative group">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-surface-tertiary flex items-center justify-center">
                            {profilePhoto ? (
                                <img src={getImageUrl(profilePhoto)} alt={formData.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-ink-tertiary">
                                    {formData.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                </span>
                            )}
                        </div>
                        <label className="absolute bottom-1 right-1 p-2 bg-accent-500 text-white rounded-full shadow-lg cursor-pointer hover:bg-accent-600 transition-colors">
                            <Camera size={14} />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'profile')} />
                        </label>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary truncate">{formData.name || 'Your Name'}</h1>
                        <p className="text-sm text-ink-tertiary truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-3 bg-surface-tertiary text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-surface-tertiary transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-black/10 shrink-0"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>

                
                <div className="flex gap-1 p-1 bg-surface-elevated rounded-xl border border-border-primary mb-6 overflow-x-auto">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeSection === section.id
                                    ? 'bg-accent-500 text-white shadow-sm'
                                    : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-primary'
                            }`}
                        >
                            {section.icon}
                            <span className="hidden sm:inline">{section.label}</span>
                        </button>
                    ))}
                </div>

                
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-elevated rounded-2xl border border-border-primary p-6 sm:p-8 mb-8"
                >
                    {activeSection === 'info' && (
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={inputClass}
                                    placeholder="Your display name"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Bio</label>
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className={inputClass}
                                    placeholder="Tell the community about yourself..."
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Location</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={`${inputClass} pl-10`}
                                        placeholder="St. Kitts & Nevis"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Website</label>
                                <div className="relative">
                                    <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className={`${inputClass} pl-10`}
                                        placeholder="https://yoursite.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Banner Color</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {['#0d9488', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#10b981', '#1e293b', '#ec4899', '#84cc16'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({ ...formData, banner_color: color })}
                                            className={`w-9 h-9 rounded-full border-2 transition-all ${
                                                formData.banner_color === color ? 'border-teal-500 scale-110 shadow-lg' : 'border-border-primary hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.banner_color}
                                        onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })}
                                        className="w-12 h-12 rounded-lg border-2 border-border-primary p-1 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.banner_color}
                                        onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })}
                                        className={`${inputClass} flex-1 max-w-[180px] font-mono text-xs uppercase`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'photos' && (
                        <div className="space-y-8">
                            <div>
                                <label className={labelClass}>Profile Photo</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-secondary border-2 border-dashed border-border-primary flex items-center justify-center shrink-0">
                                        {profilePhoto ? (
                                            <img src={getImageUrl(profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={24} className="text-ink-tertiary" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="px-4 py-2 bg-surface-tertiary text-white rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-surface-tertiary transition-colors inline-block">
                                            Upload Photo
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'profile')} />
                                        </label>
                                        <p className="text-[10px] text-ink-tertiary mt-2">JPG, PNG or GIF. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Banner Image</label>
                                <div className="h-32 rounded-xl overflow-hidden bg-surface-secondary border-2 border-dashed border-border-primary flex items-center justify-center relative group">
                                    {bannerImage ? (
                                        <>
                                            <img src={getImageUrl(bannerImage)} alt="Banner" className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                <span className="bg-surface-elevated px-4 py-2 rounded-lg text-xs font-bold uppercase">Change Banner</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
                                            </label>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center cursor-pointer">
                                            <Camera size={32} className="text-ink-tertiary mb-2" />
                                            <span className="text-xs text-ink-tertiary font-medium">Click to upload banner</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
                                        </label>
                                    )}
                                </div>
                                <p className="text-[10px] text-ink-tertiary mt-2">Recommended: 1200x400px. Max 5MB.</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'contact' && (
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className={`${inputClass} pl-10 bg-surface-primary text-ink-tertiary`}
                                    />
                                </div>
                                <p className="text-[10px] text-ink-tertiary mt-1">Email can be changed in Security settings</p>
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`${inputClass} pl-10`}
                                        placeholder="+1 (869) 555-0123"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Location</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={`${inputClass} pl-10`}
                                        placeholder="St. Kitts & Nevis"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-sand-500/5 border border-sand-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Shield size={20} className="text-sand-500 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-sand-700">Two-Factor Authentication</h4>
                                        <p className="text-xs text-sand-500 mt-1">Add an extra layer of security to your account</p>
                                        <button className="mt-3 px-4 py-2 bg-sand-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-sand-600 transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-surface-primary border border-border-primary rounded-xl">
                                <h4 className="text-sm font-bold text-ink-primary">Change Password</h4>
                                <p className="text-xs text-ink-tertiary mt-1">Update your password regularly</p>
                                <button className="mt-3 px-4 py-2 bg-surface-tertiary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-surface-tertiary transition-colors">
                                    Change Password
                                </button>
                            </div>
                            <div className="p-4 bg-surface-primary border border-border-primary rounded-xl">
                                <h4 className="text-sm font-bold text-ink-primary">Change Email</h4>
                                <p className="text-xs text-ink-tertiary mt-1">Update your email address</p>
                                <button className="mt-3 px-4 py-2 bg-surface-tertiary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-surface-tertiary transition-colors">
                                    Change Email
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'preferences' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-surface-primary rounded-xl">
                                <div>
                                    <h4 className="text-sm font-bold text-ink-primary">Email Notifications</h4>
                                    <p className="text-xs text-ink-tertiary">Receive order updates and promotions</p>
                                </div>
                                <button className="w-12 h-7 bg-accent-500 rounded-full relative transition-colors">
                                    <span className="absolute right-1 top-1 w-5 h-5 bg-surface-elevated rounded-full shadow-sm" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-surface-primary rounded-xl">
                                <div>
                                    <h4 className="text-sm font-bold text-ink-primary">SMS Notifications</h4>
                                    <p className="text-xs text-ink-tertiary">Get text alerts for important updates</p>
                                </div>
                                <button className="w-12 h-7 bg-surface-tertiary rounded-full relative transition-colors">
                                    <span className="absolute left-1 top-1 w-5 h-5 bg-surface-elevated rounded-full shadow-sm" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-surface-primary rounded-xl">
                                <div>
                                    <h4 className="text-sm font-bold text-ink-primary">Marketing Emails</h4>
                                    <p className="text-xs text-ink-tertiary">Receive tips and feature announcements</p>
                                </div>
                                <button className="w-12 h-7 bg-surface-tertiary rounded-full relative transition-colors">
                                    <span className="absolute left-1 top-1 w-5 h-5 bg-surface-elevated rounded-full shadow-sm" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>

                
                <div className="bg-surface-elevated rounded-2xl border border-red-200 p-6 mb-8">
                    <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-3">Danger Zone</h3>
                    <p className="text-xs text-ink-tertiary mb-4">Once you deactivate your account, there is no going back.</p>
                    <button
                        onClick={handleDeactivate}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        Deactivate Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ProfilePageContent />
        </Suspense>
    );
}

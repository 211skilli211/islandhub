'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/auth';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';

// Dynamic import for ImageUpload with loading skeleton
const ImageUpload = dynamic(
    () => import('@/components/ImageUpload'),
    {
        loading: () => <div className="h-32 bg-slate-100 animate-pulse rounded-xl" />,
        ssr: false // Image cropper needs window
    }
); // Import getImageUrl from api

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('account');
    const [vendorData, setVendorData] = useState({
        business_name: '',
        location: '',
        description: '',
        logo_url: '',
        banner_url: ''
    });
    const [accountData, setAccountData] = useState({
        name: '',
        bio: '',
        country: ''
    });
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [mediaLoading, setMediaLoading] = useState(false);

    useEffect(() => {
        if ((user?.role === 'vendor' || user?.role === 'admin') && activeTab === 'vendor-settings') {
            api.get(`/vendors/${user.id}`).then(res => {
                setVendorData({
                    business_name: res.data.business_name || '',
                    location: res.data.location || '',
                    description: res.data.description || '',
                    logo_url: res.data.logo_url || '',
                    banner_url: res.data.banner_url || ''
                });
            }).catch(err => console.error('Failed to load vendor settings', err));
        }

        if (activeTab === 'account' && user) {
            setAccountData({
                name: user.name || '',
                bio: (user as any).bio || '',
                country: (user as any).country || ''
            });
        }

        if (activeTab === 'media-library') {
            fetchMedia();
        }
    }, [user, activeTab]);

    const fetchMedia = async () => {
        setMediaLoading(true);
        try {
            const res = await api.get('/uploads');
            setMediaItems(res.data.media || []);
        } catch (err) {
            console.error('Failed to load media', err);
        } finally {
            setMediaLoading(false);
        }
    };

    const handleDeleteMedia = async (filename: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await api.delete(`/uploads/${filename}`);
            setMediaItems(prev => prev.filter(item => item.filename !== filename));
        } catch (err) {
            console.error('Failed to delete media', err);
            alert('Failed to delete image');
        }
    };

    const handleVendorUpdate = async () => {
        try {
            await api.post('/vendors', vendorData);
            alert('Vendor profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update vendor profile');
        }
    };

    const handleAccountUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/profile', accountData);
            if (user) {
                useAuthStore.getState().setUser({ ...user, ...res.data });
            }
            alert('Account updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update account');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Settings</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'account' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Account
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('profile-images')}
                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'profile-images' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Profile Images
                        </button>
                        {(user?.role === 'vendor' || user?.role === 'admin') && (
                            <button
                                onClick={() => setActiveTab('vendor-settings')}
                                className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'vendor-settings' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                Vendor Settings
                            </button>
                        )}
                        {user?.role === 'user' && (
                            <Link
                                href="/become-vendor"
                                className="text-left px-4 py-3 rounded-xl font-bold transition-all text-orange-600 hover:bg-orange-50"
                            >
                                <span className="mr-2">🚀</span> Become a Vendor
                            </Link>
                        )}
                        <button
                            onClick={() => setActiveTab('media-library')}
                            className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'media-library' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            Media Library
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8">
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
                                    <p className="text-slate-500 text-sm">Update your profile details.</p>
                                </div>
                                <form onSubmit={handleAccountUpdate} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={accountData.name}
                                            onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                                        <textarea
                                            value={accountData.bio}
                                            onChange={(e) => setAccountData(prev => ({ ...prev, bio: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                                        <input
                                            type="text"
                                            value={accountData.country}
                                            onChange={(e) => setAccountData(prev => ({ ...prev, country: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email}
                                            disabled
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                                    <p className="text-slate-500 text-sm">Manage how we contact you.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                                        <div>
                                            <div className="font-bold text-slate-900">Email Notifications</div>
                                            <div className="text-xs text-slate-500">Receive updates about your account and listings.</div>
                                        </div>
                                        <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                                        <div>
                                            <div className="font-bold text-slate-900">Marketing Emails</div>
                                            <div className="text-xs text-slate-500">Receive news and special offers.</div>
                                        </div>
                                        <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Security</h2>
                                    <p className="text-slate-500 text-sm">Manage your password and security settings.</p>
                                </div>
                                <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                                    <div className="font-bold text-red-900 mb-2">Delete Account</div>
                                    <p className="text-sm text-red-800 mb-4">Permanently delete your account and all associated data.</p>
                                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700">
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile-images' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Profile Images</h2>
                                    <p className="text-slate-500 text-sm">Manage your avatar and cover photo.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ImageUpload
                                        type="avatar"
                                        label="Profile Avatar"
                                        currentImage={user?.avatar_url ? getImageUrl(user.avatar_url) : undefined}
                                        onUpload={async (url) => {
                                            if (user) {
                                                try {
                                                    await api.put('/users/profile', { avatar_url: url });
                                                    useAuthStore.getState().setUser({ ...user, avatar_url: url });
                                                    toast.success('Avatar updated');
                                                } catch (e) {
                                                    toast.error('Failed to save avatar');
                                                }
                                            }
                                        }}
                                        aspectRatio="1:1"
                                    />
                                    <ImageUpload
                                        type="banner"
                                        label="Cover Photo"
                                        currentImage={user?.cover_photo_url ? getImageUrl(user.cover_photo_url) : undefined}
                                        onUpload={async (url) => {
                                            if (user) {
                                                try {
                                                    await api.put('/users/profile', { cover_photo_url: url });
                                                    useAuthStore.getState().setUser({ ...user, cover_photo_url: url });
                                                    toast.success('Banner updated');
                                                } catch (e) {
                                                    toast.error('Failed to save banner');
                                                }
                                            }
                                        }}
                                        aspectRatio="16:9"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'vendor-settings' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Vendor Settings</h2>
                                    <p className="text-slate-500 text-sm">Manage your store's public identity and contact info.</p>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <ImageUpload
                                            type="avatar"
                                            label="Store Logo"
                                            currentImage={vendorData.logo_url ? getImageUrl(vendorData.logo_url) : undefined}
                                            onUpload={(url) => setVendorData(prev => ({ ...prev, logo_url: url }))}
                                        />
                                        <ImageUpload
                                            type="banner"
                                            label="Store Banner"
                                            currentImage={vendorData.banner_url ? getImageUrl(vendorData.banner_url) : undefined}
                                            onUpload={(url) => setVendorData(prev => ({ ...prev, banner_url: url }))}
                                            aspectRatio="16:9"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Business Name</label>
                                            <input
                                                type="text"
                                                value={vendorData.business_name}
                                                onChange={(e) => setVendorData(prev => ({ ...prev, business_name: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={vendorData.location}
                                                onChange={(e) => setVendorData(prev => ({ ...prev, location: e.target.value }))}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Store Description</label>
                                        <textarea
                                            rows={4}
                                            value={vendorData.description}
                                            onChange={(e) => setVendorData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>

                                    <button
                                        onClick={handleVendorUpdate}
                                        className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
                                    >
                                        Update Store Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'media-library' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Media Library</h2>
                                    <p className="text-slate-500 text-sm">All your uploaded files in one place.</p>
                                </div>

                                {mediaLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                                    </div>
                                ) : mediaItems.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                                        No media files found.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {mediaItems.map((item, index) => (
                                            <div key={item.media_id || item.id || item.filename || index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img
                                                    src={getImageUrl(item.url)}
                                                    alt={item.filename}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform flex justify-between items-center">
                                                    <span className="text-[10px] text-white truncate">{item.filename}</span>
                                                    <button
                                                        onClick={() => handleDeleteMedia(item.filename)}
                                                        className="p-1 hover:bg-red-500/50 rounded transition-colors text-white"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

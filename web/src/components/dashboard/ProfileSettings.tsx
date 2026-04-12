
'use client';

import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth';

export default function ProfileSettings() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: '',
        banner_color: '#0d9488',
    });
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [bannerImage, setBannerImage] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
        }
    }, [user?.id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/users/${user?.id}`);
            const data = res.data;
            setFormData({
                name: data.name || '',
                bio: data.bio || '',
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

        const formData = new FormData();
        formData.append('image', file);

        setLoading(true);
        const endpoint = type === 'profile' ? '/uploads/profile-photo' : '/uploads/banner-image';

        try {
            const res = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (type === 'profile') setProfilePhoto(res.data.url);
            else setBannerImage(res.data.url);

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated!`);

            if (type === 'profile' && user) {
                // Backend now returns avatar_url (aliased)
                const newAvatarUrl = res.data.avatar_url || res.data.url;
                setUser({ ...user, avatar_url: newAvatarUrl });
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/users/update', formData);
            toast.success('Profile updated successfully!');
            // Update local store (Backend returns aliased avatar_url)
            if (user) {
                setUser({
                    ...user,
                    ...res.data,
                    name: res.data.name || user.name
                });
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 pb-12">
            <section>
                <h3 className="text-xl font-black text-slate-800 mb-6">Profile Appearance</h3>

                <div className="space-y-8">
                    {/* Banner Section */}
                    <div
                        className="relative h-48 rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group"
                        style={{ backgroundColor: formData.banner_color }}
                    >
                        {bannerImage ? (
                            <img src={getImageUrl(bannerImage)} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Banner (Click to upload)</div>
                        )}
                        <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <span className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase text-slate-900 shadow-xl">Change Banner Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
                        </label>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Photo */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                                {profilePhoto ? (
                                    <img src={getImageUrl(profilePhoto)} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">🏝️</span>
                                )}
                            </div>
                            <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <span className="text-[10px] font-black text-white uppercase">Upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'profile')} />
                            </label>
                        </div>

                        {/* Name & Color */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Banner Color</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {['#0d9488', '#6366f1', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#10b981', '#1e293b'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({ ...formData, banner_color: color })}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.banner_color === color ? 'border-teal-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={formData.banner_color}
                                            onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })}
                                            className="w-12 h-12 rounded-lg border-2 border-teal-500 p-1 cursor-pointer"
                                        />
                                        <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[6px] font-black px-1 rounded-full uppercase">Current</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.banner_color}
                                        onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })}
                                        className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 transition-all font-mono text-xs uppercase focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio / Tagline</label>
                    <textarea
                        rows={4}
                        placeholder="Tell the community about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-5 py-4 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all font-medium text-slate-600 leading-relaxed"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                    >
                        {loading ? 'Saving Updates...' : 'Save Profile Changes'}
                    </button>
                </div>
            </section>
        </div>
    );
}


'use client';

import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth';

export default function CommunityPosts() {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: 'general',
        media_url: '',
        media_type: 'image'
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/posts', newPost);
            toast.success('Post broadcasted successfully!');
            setShowCreate(false);
            setNewPost({ title: '', content: '', category: 'general', media_url: '', media_type: 'image' });
            fetchPosts();
        } catch (error) {
            toast.error('Failed to broadcast post');
        }
    };

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading media...', { id: 'upload' });
            const res = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewPost({ ...newPost, media_url: res.data.url });
            toast.success('Media uploaded!', { id: 'upload' });
        } catch (error) {
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Community Broadcasts</h3>
                    <p className="text-sm font-medium text-slate-400">Share updates, deals, and announcements</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${showCreate ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-lg'}`}
                >
                    {showCreate ? 'Close Form' : '🚀 Send Broadcast'}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreatePost} className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-100/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Broadcast Title</label>
                            <input
                                type="text"
                                required
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                placeholder="What's happening?"
                                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                            <select
                                value={newPost.category}
                                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 font-bold bg-white"
                            >
                                <option value="general">📢 General Announcement</option>
                                <option value="food">🍱 Food & Dining</option>
                                <option value="deals">🏷️ Exclusive Deals</option>
                                <option value="events">🎉 Upcoming Events</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content</label>
                        <textarea
                            rows={3}
                            required
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            placeholder="Share the details..."
                            className="w-full px-5 py-4 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">Attached Media</label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-center gap-2">
                                    <span className="text-xl">🖼️</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload Image/Video</span>
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
                                </label>
                                {newPost.media_url && (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={getImageUrl(newPost.media_url)} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100"
                        >
                            Broadcast Now
                        </button>
                    </div>
                    <div className="text-center">
                        <a href="/admin?tab=broadcasts" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                            Manage in Broadcast Hub ➔
                        </a>
                    </div>
                </form>
            )}

            <div className="max-w-2xl mx-auto space-y-12">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600" />
                    </div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.post_id} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 group transition-all">
                            {/* Instagram Header */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full ring-2 ring-indigo-100 p-0.5 overflow-hidden">
                                        {post.profile_photo_url ? (
                                            <img src={getImageUrl(post.profile_photo_url)} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-slate-400 bg-slate-50 rounded-full text-sm">
                                                {post.user_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-slate-900 tracking-tight leading-none">{post.user_name}</h4>
                                            <span className="text-teal-500 text-[10px] font-black uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">Verified</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {post.category} • {new Date(post.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                </button>
                            </div>

                            {/* Square Media Post */}
                            {post.media_url ? (
                                <div className="aspect-square bg-slate-50 relative overflow-hidden group/media">
                                    {post.media_type === 'video' ? (
                                        <video src={getImageUrl(post.media_url)} controls className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={getImageUrl(post.media_url)} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/5 transition-colors pointer-events-none" />
                                </div>
                            ) : (
                                <div className="aspect-square bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center p-12 text-center text-white">
                                    <h3 className="text-3xl font-black italic tracking-tighter leading-[1.1]">
                                        "{post.title}"
                                    </h3>
                                </div>
                            )}

                            {/* Instagram-style Interaction Bar */}
                            <div className="p-6">
                                <div className="flex items-center gap-6 mb-6">
                                    <button className="flex items-center gap-2 group/btn">
                                        <span className="text-2xl group-hover/btn:scale-125 transition-transform">❤️</span>
                                        <span className="text-xs font-black text-slate-900">12.5k</span>
                                    </button>
                                    <button className="flex items-center gap-2 group/btn">
                                        <span className="text-2xl group-hover/btn:scale-125 transition-transform text-slate-300">💬</span>
                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">48</span>
                                    </button>
                                    <button className="ml-auto flex items-center gap-2 group/btn">
                                        <span className="text-2xl group-hover/btn:rotate-12 transition-transform">🔖</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-slate-900 leading-tight italic">{post.title}</h3>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                        <span className="font-black text-slate-900 mr-2">{post.user_name}</span>
                                        {post.content}
                                    </p>
                                </div>

                                {/* Comments Preview */}
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Community Comments</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
                                        <input
                                            placeholder="Join the conversation..."
                                            className="w-full bg-slate-100/50 border-none rounded-2xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                        <div className="text-6xl mb-6">🌊</div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">The airwaves are quiet</h3>
                        <p className="text-slate-500 font-medium italic mb-8">Be the first to broadcast from your slice of paradise.</p>
                        <button onClick={() => setShowCreate(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">Send First Broadcast</button>
                    </div>
                )}
            </div>
        </div>
    );
}

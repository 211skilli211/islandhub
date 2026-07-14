'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { X, ChevronLeft, ChevronRight, Heart, Send, Plus, Play, Pause, Volume2, VolumeX, MoreHorizontal, Eye } from 'lucide-react';

interface Story {
    id: number;
    user_id: number;
    user_name: string;
    profile_photo_url: string;
    media_url: string;
    media_type: 'image' | 'video';
    content: string;
    created_at: string;
    expires_at: string;
    view_count: number;
    reaction_count: number;
    is_viewed: boolean;
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
    'from-teal-400 to-teal-600', 'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-600', 'from-rose-400 to-pink-500',
    'from-cyan-400 to-blue-500', 'from-emerald-400 to-green-500',
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Story Viewer ─────────────────────────────────────

function StoryViewer({ stories, initialIndex, onClose, onPrevUser, onNextUser }: {
    stories: Story[]; initialIndex: number; onClose: () => void;
    onPrevUser: () => void; onNextUser: () => void;
}) {
    const [currentIdx, setCurrentIdx] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [liked, setLiked] = useState(false);
    const [muted, setMuted] = useState(true);
    const [replyText, setReplyText] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef(0);
    const touchStartX = useRef(0);

    const current = stories[currentIdx];

    useEffect(() => {
        setProgress(0);
        progressRef.current = 0;
        setLiked(false);
        setReplyText('');

        const tick = () => {
            progressRef.current += 1.67;
            setProgress(progressRef.current);
            if (progressRef.current >= 100) {
                if (currentIdx < stories.length - 1) {
                    setCurrentIdx(c => c + 1);
                } else {
                    onNextUser();
                }
            }
        };

        if (!paused) {
            intervalRef.current = setInterval(tick, 50);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentIdx, paused]);

    const handlePrev = () => {
        if (currentIdx > 0) setCurrentIdx(c => c - 1);
        else onPrevUser();
    };

    const handleNext = () => {
        if (currentIdx < stories.length - 1) setCurrentIdx(c => c + 1);
        else onNextUser();
    };

    const handleLike = () => {
        setLiked(!liked);
        api.post(`/stories/${current.id}/react`).catch(() => {});
    };

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            api.post(`/stories/${current.id}/reply`, { message: replyText.trim() }).catch(() => {});
            setReplyText('');
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) handlePrev();
            else handleNext();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
            <div
                className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Progress bars */}
                <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                    {stories.slice(0, Math.min(5, stories.length)).map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-75"
                                style={{
                                    width: i < currentIdx ? '100%' : i === currentIdx ? `${progress}%` : '0%',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Top bar */}
                <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarColor(current.user_name)} p-[2px]`}>
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                {current.profile_photo_url ? (
                                    <img src={current.profile_photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-white text-[9px] font-bold">{getInitials(current.user_name)}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-white text-sm font-bold block leading-tight">{current.user_name}</span>
                            <span className="text-white/50 text-[10px]">{timeAgo(current.created_at)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleLike} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                            <Heart size={18} className={liked ? 'text-rose-500 fill-rose-500' : 'text-white'} />
                        </button>
                        <button onClick={() => setMuted(!muted)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                            {muted ? <VolumeX size={16} className="text-white/70" /> : <Volume2 size={16} className="text-white/70" />}
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                            <X size={18} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Story content */}
                <div className="w-full h-full rounded-2xl overflow-hidden bg-surface-elevated cursor-pointer"
                    onClick={() => setPaused(!paused)}
                >
                    <div className="w-full h-full flex items-center justify-center relative">
                        {current.media_url ? (
                            <img src={current.media_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-8 w-full">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(current.user_name)} mx-auto mb-6 flex items-center justify-center`}>
                                    <span className="text-white text-2xl font-black">{getInitials(current.user_name)}</span>
                                </div>
                                <p className="text-white text-xl font-bold leading-relaxed max-w-xs mx-auto mb-4">{current.content}</p>
                                <div className="flex items-center justify-center gap-4 text-white/50 text-xs">
                                    <span className="flex items-center gap-1"><Eye size={14} /> {current.view_count} views</span>
                                    <span className="flex items-center gap-1"><Heart size={14} /> {current.reaction_count} reactions</span>
                                </div>
                            </div>
                        )}

                        {/* Pause overlay */}
                        <AnimatePresence>
                            {paused && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Play size={28} className="text-white ml-1" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bottom - reply input */}
                <div className="absolute bottom-3 left-3 right-3 z-20">
                    <form onSubmit={handleReply} className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Send a message..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-all"
                        />
                        <button type="submit" disabled={!replyText.trim()}
                            className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center hover:bg-accent-600 disabled:opacity-40 transition-all shadow-lg">
                            <Send size={16} className="text-white ml-0.5" />
                        </button>
                    </form>
                </div>

                {/* Nav buttons */}
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-1 z-20 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors opacity-0 hover:opacity-100">
                    <ChevronLeft size={20} className="text-white" />
                </button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-1 z-20 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors opacity-0 hover:opacity-100">
                    <ChevronRight size={20} className="text-white" />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);

    useEffect(() => {
        const fetchStories = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/stories/feed');
                const data = response.data || response;
                setStories(Array.isArray(data) ? data : data?.stories || getSampleStories());
            } catch { setStories(getSampleStories()); }
            setIsLoading(false);
        };
        fetchStories();
    }, []);

    const getSampleStories = (): Story[] => [
        { id: 1, user_id: 1, user_name: 'Maria Santos', profile_photo_url: '', media_url: '', media_type: 'image', content: 'IslandHub helped me grow my catering business from 5 to 50 clients in just 3 months! 🌟', created_at: new Date(Date.now() - 3600000).toISOString(), expires_at: new Date(Date.now() + 82800000).toISOString(), view_count: 156, reaction_count: 42, is_viewed: false },
        { id: 2, user_id: 2, user_name: 'James Wilson', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Found the perfect vacation rental for my family through this platform. Amazing experience! 🏠', created_at: new Date(Date.now() - 7200000).toISOString(), expires_at: new Date(Date.now() + 79200000).toISOString(), view_count: 89, reaction_count: 23, is_viewed: true },
        { id: 3, user_id: 3, user_name: 'Sarah Chen', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Just launched my handmade jewelry collection! Check it out 🎉', created_at: new Date(Date.now() - 10800000).toISOString(), expires_at: new Date(Date.now() + 75600000).toISOString(), view_count: 234, reaction_count: 67, is_viewed: false },
        { id: 4, user_id: 4, user_name: 'Mike Rivera', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Sunset surf session at the secret spot. Life is good 🏄‍♂️', created_at: new Date(Date.now() - 14400000).toISOString(), expires_at: new Date(Date.now() + 72000000).toISOString(), view_count: 312, reaction_count: 89, is_viewed: false },
        { id: 5, user_id: 5, user_name: 'Ana Paul', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Farmers market haul — the avocados are incredible this season! 🥑', created_at: new Date(Date.now() - 18000000).toISOString(), expires_at: new Date(Date.now() + 68400000).toISOString(), view_count: 78, reaction_count: 34, is_viewed: true },
        { id: 6, user_id: 6, user_name: 'David King', profile_photo_url: '', media_url: '', media_type: 'image', content: 'New to the island! Anyone have recommendations for the best local spots? 🌴', created_at: new Date(Date.now() - 21600000).toISOString(), expires_at: new Date(Date.now() + 64800000).toISOString(), view_count: 45, reaction_count: 12, is_viewed: false },
    ];

    const handleStoryClick = (index: number) => {
        setActiveStoryIndex(index);
        setViewerOpen(true);
    };

    const handlePrevUser = () => {
        if (activeStoryIndex !== null && activeStoryIndex > 0) {
            setActiveStoryIndex(activeStoryIndex - 1);
        }
    };

    const handleNextUser = () => {
        if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
        } else {
            setViewerOpen(false);
        }
    };

    // Group stories for the current user (for viewer)
    const currentUserStories = activeStoryIndex !== null
        ? [stories[activeStoryIndex]]
        : [];

    return (
        <main className="min-h-screen bg-surface-primary">
            {/* Header */}
            <div className="bg-gradient-to-br from-surface-elevated to-surface-secondary border-b border-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-[9px] font-black uppercase tracking-widest">📸 Stories</span>
                                <span className="text-xs text-tertiary font-semibold">24h stories from the island</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                                Island <span className="text-accent-400">Stories</span>
                            </h1>
                            <p className="text-sm text-tertiary mt-1">Watch stories from your community before they disappear.</p>
                        </div>
                        <Link href="/community/stories/create"
                            className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20">
                            <Plus size={14} /> Create Story
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stories grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="aspect-[3/4] bg-surface-secondary animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : stories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {stories.map((story, idx) => (
                            <motion.button
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleStoryClick(idx)}
                                className="group relative aspect-[3/4] bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary hover:border-accent-500/30 hover:shadow-xl transition-all text-left"
                            >
                                {/* Background gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-400/20 via-surface-elevated to-surface-elevated" />

                                {/* Avatar */}
                                <div className="absolute top-3 left-3 z-10">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${story.is_viewed ? 'border-2 border-white/30' : 'ring-2 ring-accent-400'} p-[2px]`}>
                                        <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden">
                                            {story.profile_photo_url ? (
                                                <img src={story.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(story.user_name)} flex items-center justify-center`}>
                                                    <span className="text-white text-[10px] font-bold">{getInitials(story.user_name)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                                    <p className="text-white text-xs font-bold truncate">{story.user_name}</p>
                                    {story.content && (
                                        <p className="text-white/70 text-[10px] line-clamp-2 mt-0.5">{story.content}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-white/50">
                                        <span>{timeAgo(story.created_at)}</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-0.5"><Eye size={10} /> {story.view_count}</span>
                                    </div>
                                </div>

                                {/* Unviewed indicator */}
                                {!story.is_viewed && (
                                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-accent-400 ring-2 ring-surface-elevated" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-16 text-center">
                        <span className="text-5xl block mb-4">📸</span>
                        <h3 className="text-xl font-black text-primary mb-2">No stories yet</h3>
                        <p className="text-sm text-tertiary mb-2">Be the first to share a story!</p>
                        <p className="text-xs text-tertiary/60 mb-6">Stories disappear after 24 hours.</p>
                        <Link href="/community/stories/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors">
                            <Plus size={14} /> Create Story
                        </Link>
                    </div>
                )}
            </section>

            {/* Story Viewer Overlay */}
            <AnimatePresence>
                {viewerOpen && activeStoryIndex !== null && currentUserStories.length > 0 && (
                    <StoryViewer
                        stories={currentUserStories}
                        initialIndex={0}
                        onClose={() => setViewerOpen(false)}
                        onPrevUser={handlePrevUser}
                        onNextUser={handleNextUser}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
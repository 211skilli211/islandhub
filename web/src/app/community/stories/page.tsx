'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

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

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStory, setActiveStory] = useState<Story | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/stories/feed');
                setStories(response.data || response || []);
            } catch (error) {
                console.error('Failed to fetch stories:', error);
                setStories(getSampleStories());
            } finally {
                setIsLoading(false);
            }
        };
        fetchStories();
    }, []);

    const getSampleStories = (): Story[] => [
        {
            id: 1,
            user_id: 1,
            user_name: 'Maria Santos',
            profile_photo_url: '',
            media_url: '',
            media_type: 'image',
            content: 'IslandHub helped me grow my catering business from 5 to 50 clients in just 3 months!',
            created_at: '2026-03-05T10:00:00',
            expires_at: '2026-03-06T10:00:00',
            view_count: 156,
            reaction_count: 42,
            is_viewed: false
        },
        {
            id: 2,
            user_id: 2,
            user_name: 'James Wilson',
            profile_photo_url: '',
            media_url: '',
            media_type: 'image',
            content: 'Found the perfect vacation rental for my family through this platform. Amazing experience!',
            created_at: '2026-03-05T09:00:00',
            expires_at: '2026-03-06T09:00:00',
            view_count: 89,
            reaction_count: 23,
            is_viewed: true
        },
        {
            id: 3,
            user_id: 3,
            user_name: 'Sarah Chen',
            profile_photo_url: '',
            media_url: '',
            media_type: 'image',
            content: 'Just launched my handmade jewelry collection! Check it out 🎉',
            created_at: '2026-03-05T08:00:00',
            expires_at: '2026-03-06T08:00:00',
            view_count: 234,
            reaction_count: 67,
            is_viewed: false
        },
        {
            id: 4,
            user_id: 4,
            user_name: 'Mike Rivera',
            profile_photo_url: '',
            media_url: '',
            media_type: 'image',
            content: 'Sunset surf session at the secret spot. Life is good 🏄‍♂️',
            created_at: '2026-03-05T18:00:00',
            expires_at: '2026-03-06T18:00:00',
            view_count: 312,
            reaction_count: 89,
            is_viewed: false
        },
        {
            id: 5,
            user_id: 5,
            user_name: 'Lisa Thompson',
            profile_photo_url: '',
            media_url: '',
            media_type: 'image',
            content: 'Thanks to everyone who came to our beach cleanup today! Together we made a difference 🌊',
            created_at: '2026-03-04T14:00:00',
            expires_at: '2026-03-05T14:00:00',
            view_count: 178,
            reaction_count: 45,
            is_viewed: true
        },
        {
            id: 6,
            user_id: 6,
            user_name: 'David Park',
            profile_photo_url: '',
            media_url: '',
            media_type: 'image',
            content: 'New menu dropping next week! Get ready for some island-inspired fusion cuisine 👨‍🍳',
            created_at: '2026-03-05T12:00:00',
            expires_at: '2026-03-06T12:00:00',
            view_count: 445,
            reaction_count: 112,
            is_viewed: false
        }
    ];

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
        if (!acc[story.user_id]) {
            acc[story.user_id] = [];
        }
        acc[story.user_id].push(story);
        return acc;
    }, {} as Record<number, Story[]>);

    const users = Object.keys(groupedStories).map(userId => ({
        userId: Number(userId),
        stories: groupedStories[Number(userId)],
        latestStory: groupedStories[Number(userId)][0]
    }));

    return (
        <main className="min-h-screen bg-slate-50">
            <HeroBackground pageKey="community" className="py-16">
                <div className="max-w-7xl mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10"
                    >
                        Community Stories 🌟
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                    >
                        Real Stories, Real People
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-teal-50 text-xl max-w-2xl mx-auto mb-12 font-medium opacity-80 leading-relaxed"
                    >
                        Discover inspiring stories from your island community (24hr stories)
                    </motion.p>
                </div>
            </HeroBackground>

            <section className="max-w-7xl mx-auto px-4 py-12">
                {/* Stories Row - Instagram style */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Latest Stories</h2>

                    {isLoading ? (
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="shrink-0 w-24 h-24 bg-slate-200 rounded-full animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {/* Add Story Button */}
                            <button className="shrink-0 w-24 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-3xl mb-2 hover:bg-teal-50 transition-colors">
                                    +
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Add Story</span>
                            </button>

                            {/* User Stories */}
                            {users.map(user => (
                                <button
                                    key={user.userId}
                                    onClick={() => setActiveStory(user.stories[0])}
                                    className="shrink-0 flex flex-col items-center"
                                >
                                    <div className={`w-20 h-20 rounded-full p-1 mb-2 ${!user.latestStory.is_viewed ? 'bg-linear-to-tr from-teal-400 via-teal-500 to-teal-600' : 'bg-slate-200'}`}>
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl overflow-hidden">
                                            {user.latestStory.profile_photo_url ? (
                                                <img src={user.latestStory.profile_photo_url} alt={user.latestStory.user_name} className="w-full h-full object-cover" />
                                            ) : (
                                                '👤'
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 max-w-[80px] truncate">
                                        {user.latestStory.user_name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Featured Stories Grid */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-slate-900">Featured Stories</h2>
                        <span className="text-sm font-bold text-slate-400">Stories disappear after 24 hours</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stories.map((story, index) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setActiveStory(story)}
                                className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-teal-500/10 transition-all cursor-pointer group"
                            >
                                {/* Story Media */}
                                <div className="h-48 bg-linear-to-br from-teal-400 to-teal-600 relative">
                                    {story.media_url ? (
                                        <img src={story.media_url} alt={story.user_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                            {story.media_type === 'video' ? '🎥' : '📸'}
                                        </div>
                                    )}

                                    {/* Time indicator */}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                                        {getTimeAgo(story.created_at)}
                                    </div>

                                    {/* User info overlay */}
                                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl overflow-hidden">
                                            {story.profile_photo_url ? (
                                                <img src={story.profile_photo_url} alt={story.user_name} className="w-full h-full object-cover" />
                                            ) : (
                                                '👤'
                                            )}
                                        </div>
                                        <span className="text-white font-black text-sm">{story.user_name}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <p className="text-slate-700 font-medium mb-4 line-clamp-2">
                                        {story.content}
                                    </p>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                        <span>👁️ {story.view_count} views</span>
                                        <span>❤️ {story.reaction_count} reactions</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Story Highlights */}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Story Highlights</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {['Food', 'Beach', 'Events', 'Business', 'Sports', 'Art'].map((highlight, index) => (
                            <div key={highlight} className="bg-white rounded-3xl p-6 text-center border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer">
                                <div className="w-16 h-16 mx-auto mb-3 bg-linear-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-2xl">
                                    {['🍽️', '🏖️', '🎉', '💼', '⚽', '🎨'][index]}
                                </div>
                                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{highlight}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Viewer Modal */}
            {activeStory && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                    onClick={() => setActiveStory(null)}
                >
                    <div className="max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className="bg-black rounded-3xl overflow-hidden">
                            {/* Story Content */}
                            <div className="relative aspect-9/16 bg-linear-to-br from-teal-800 to-teal-900">
                                {activeStory.media_url ? (
                                    <img src={activeStory.media_url} alt={activeStory.user_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-8xl p-8 text-center">
                                        <p className="text-white font-medium">{activeStory.content}</p>
                                    </div>
                                )}

                                {/* Progress bar */}
                                <div className="absolute top-4 left-4 right-4 flex gap-1">
                                    <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-1/2"></div>
                                    </div>
                                </div>

                                {/* User info */}
                                <div className="absolute top-12 left-4 right-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl overflow-hidden">
                                        {activeStory.profile_photo_url ? (
                                            <img src={activeStory.profile_photo_url} alt={activeStory.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            '👤'
                                        )}
                                    </div>
                                    <span className="text-white font-black text-sm">{activeStory.user_name}</span>
                                    <span className="text-white/50 text-xs">{getTimeAgo(activeStory.created_at)}</span>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={() => setActiveStory(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Reply input */}
                            <div className="p-4 bg-white">
                                <input
                                    type="text"
                                    placeholder="Send a message..."
                                    className="w-full px-4 py-3 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

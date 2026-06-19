'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import { MapPin, Link as LinkIcon, Calendar, Mail, ShoppingBag, Star, Grid3X3, Heart } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface PublicProfile {
    user_id: number;
    name: string;
    email: string;
    role: string;
    bio: string;
    profile_photo_url: string;
    avatar_url: string;
    banner_image_url: string;
    banner_color: string;
    created_at: string;
    is_verified_driver: boolean;
    is_online: boolean;
    phone?: string;
    location?: string;
    website?: string;
}

function PublicProfileContent() {
    const params = useParams<{ id: string }>();
    const userId = params?.id;

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings');

    useEffect(() => {
        if (!userId) return;
        fetchProfile();
        fetchUserListings();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/users/${userId}`);
            setProfile(res.data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserListings = async () => {
        try {
            const res = await api.get(`/listings?creator_id=${userId}`);
            const data = Array.isArray(res.data) ? res.data : (res.data.listings || []);
            setListings(data);
        } catch (error) {
            console.error('Failed to fetch user listings', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-ink-primary mb-2">User not found</h1>
                    <p className="text-ink-tertiary">This profile doesn&apos;t exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const memberSince = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    const displayName = profile.name || 'Anonymous';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <div className="min-h-screen bg-surface-primary">
            
            <div
                className="relative h-48 sm:h-56 md:h-72 overflow-hidden"
                style={{ backgroundColor: profile.banner_color || '#0d9488' }}
            >
                {profile.banner_image_url && (
                    <img src={getImageUrl(profile.banner_image_url)} alt="Banner" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
                    
                    <div className="relative">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                            {(profile.profile_photo_url || profile.avatar_url) ? (
                                <img
                                    src={getImageUrl(profile.profile_photo_url || profile.avatar_url)}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-black text-white">{initials}</span>
                            )}
                        </div>
                        {profile.is_online && (
                            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                        )}
                    </div>

                    
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary truncate">{displayName}</h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1">
                            {profile.location && (
                                <span className="text-xs text-ink-tertiary flex items-center gap-1">
                                    <MapPin size={12} />
                                    {profile.location}
                                </span>
                            )}
                            <span className="text-xs text-ink-tertiary flex items-center gap-1">
                                <Calendar size={12} />
                                Joined {memberSince}
                            </span>
                            {profile.is_verified_driver && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-widest">
                                    Verified Driver
                                </span>
                            )}
                        </div>
                    </div>

                    
                    <div className="flex gap-2 shrink-0">
                        <button className="px-5 py-2.5 bg-surface-tertiary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-tertiary transition-colors flex items-center gap-2">
                            <Mail size={14} />
                            Message
                        </button>
                        <button className="px-4 py-2.5 bg-surface-elevated border border-border-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-primary transition-colors">
                            Follow
                        </button>
                    </div>
                </div>

                
                <div className="flex gap-1 p-1 bg-surface-elevated rounded-xl border border-border-primary mb-6">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'listings'
                                ? 'bg-accent-500 text-white shadow-sm'
                                : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-primary'
                        }`}
                    >
                        <Grid3X3 size={14} />
                        Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'about'
                                ? 'bg-accent-500 text-white shadow-sm'
                                : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-primary'
                        }`}
                    >
                        <Heart size={14} />
                        About
                    </button>
                </div>

                
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    {activeTab === 'listings' && (
                        <>
                            {listings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {listings.map((listing) => (
                                        <ListingCard key={listing.id || listing.listing_id} listing={listing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-12 text-center">
                                    <ShoppingBag size={48} className="mx-auto text-ink-tertiary mb-4" />
                                    <h3 className="text-lg font-bold text-ink-primary mb-2">No listings yet</h3>
                                    <p className="text-sm text-ink-tertiary">This user hasn&apos;t listed any products or services yet.</p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'about' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                                    <h3 className="text-sm font-black text-ink-primary uppercase tracking-widest mb-4">About</h3>
                                    {profile.bio ? (
                                        <p className="text-sm text-ink-secondary leading-relaxed">{profile.bio}</p>
                                    ) : (
                                        <p className="text-sm text-ink-tertiary italic">No bio provided</p>
                                    )}
                                </div>

                                
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                                    <h3 className="text-sm font-black text-ink-primary uppercase tracking-widest mb-4">Contact Info</h3>
                                    <div className="space-y-3">
                                        {profile.phone && (
                                            <div className="flex items-center gap-3 text-sm text-ink-secondary">
                                                <EmojiIcon emoji="📞" size={16} />
                                                <span>{profile.phone}</span>
                                            </div>
                                        )}
                                        {profile.website && (
                                            <div className="flex items-center gap-3 text-sm text-ink-secondary">
                                                <LinkIcon size={16} />
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline">
                                                    {profile.website}
                                                </a>
                                            </div>
                                        )}
                                        {profile.location && (
                                            <div className="flex items-center gap-3 text-sm text-ink-secondary">
                                                <MapPin size={16} />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                        {!profile.phone && !profile.website && !profile.location && (
                                            <p className="text-sm text-ink-tertiary italic">No contact info provided</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            
                            <div className="space-y-6">
                                
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                                    <h3 className="text-sm font-black text-ink-primary uppercase tracking-widest mb-4">Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-surface-primary rounded-xl">
                                            <div className="text-2xl font-black text-ink-primary">{listings.length}</div>
                                            <div className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">Listings</div>
                                        </div>
                                        <div className="text-center p-3 bg-surface-primary rounded-xl">
                                            <div className="text-2xl font-black text-ink-primary">0</div>
                                            <div className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">Reviews</div>
                                        </div>
                                        <div className="text-center p-3 bg-surface-primary rounded-xl">
                                            <div className="text-2xl font-black text-ink-primary">0</div>
                                            <div className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">Sales</div>
                                        </div>
                                        <div className="text-center p-3 bg-surface-primary rounded-xl">
                                            <div className="flex items-center justify-center gap-1 text-2xl font-black text-sand-500">
                                                <Star size={20} fill="currentColor" /> -
                                            </div>
                                            <div className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">Rating</div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                                    <h3 className="text-sm font-black text-ink-primary uppercase tracking-widest mb-3">Member Since</h3>
                                    <p className="text-sm text-ink-secondary">{memberSince}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default function PublicProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <PublicProfileContent />
        </Suspense>
    );
}

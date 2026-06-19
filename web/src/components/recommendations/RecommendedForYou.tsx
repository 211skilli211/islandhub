'use client';

import { useState, useEffect } from 'react';
import { useRecommendations } from '@/lib/hooks/use-swr';
import ListingCard from '@/components/ListingCard';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

export default function RecommendedForYou({ userId, limit = 4 }: { userId?: string, limit?: number }) {
    const { recommendations, isLoading: recLoading } = useRecommendations(userId ? 'personalized' : 'trending', limit);
    const { recommendations: trendingFlat, isLoading: trendLoading } = useRecommendations('trending', limit);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Only show loading or content after mount to avoid hydration mismatch
    if (!isMounted) {
        return <LoadingSkeleton />;
    }

    const isLoading = (!!userId && recLoading) || (!userId && trendLoading);

    // For logged-in users with recommendations
    if (userId && recommendations?.length > 0) {
        return (
            <section className="py-16">
                <div className="flex items-center gap-3 mb-8">
                    <EmojiIcon emoji="✨" size={28} />
                    <h2 className="text-3xl font-black text-ink-primary">Recommended For You</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.slice(0, limit).map((listing: any) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </section>
        );
    }

    // Fallback to trending for non-logged-in users or if no recommendations
    if (trendingFlat?.length > 0) {
        return (
            <section className="py-16 border-t border-border-primary">
                <div className="flex items-center gap-3 mb-8">
                    <EmojiIcon emoji="🔥" size={28} />
                    <h2 className="text-3xl font-black text-ink-primary">Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trendingFlat.map((listing: any) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </section>
        );
    }

    // Show loading while fetching
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return null;
}

function LoadingSkeleton() {
    return (
        <section className="py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-80 bg-surface-secondary animate-pulse rounded-3xl" />
                ))}
            </div>
        </section>
    );
}

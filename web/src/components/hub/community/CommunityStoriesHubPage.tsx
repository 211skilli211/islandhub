'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface Story {
  id: number; title: string; slug: string;
  author_name?: string; author_avatar?: string;
  preview?: string; image_url?: string;
  like_count?: number; comment_count?: number;
  created_at?: string;
}

function StoryCard({ story }: { story: Story }) {
  const title = story.title || 'Story';
  return (
    <Link href={`/hub/community/stories/${story.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        {story.image_url && (
          <div className="relative aspect-[16/10]">
            <img src={story.image_url} alt={title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 line-clamp-2">{title}</h3>
          {story.preview && <p className="text-xs text-ink-secondary mt-1 line-clamp-3">{story.preview}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs text-ink-tertiary">
            {story.author_name && <span>✍️ {story.author_name}</span>}
            {story.like_count && <span>❤️ {story.like_count}</span>}
            {story.comment_count && <span>💬 {story.comment_count}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityStoriesHubPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/search/featured?type=community&limit=12')
      .then((res: any) => setStories(res.data?.stories || res.data || []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-white mb-3">
            📸 Island Stories
          </motion.h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Community stories, updates, and island life from locals.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 pb-12 pt-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <EmptyState emoji="📸" title="No stories yet" message="Be the first to share your island story!" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stories.map((s) => <StoryCard key={s.id} story={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import Aurora from '@/components/react-bits/backgrounds/Aurora';
import BlurText from '@/components/react-bits/text/BlurText';
import AnimatedContent from '@/components/react-bits/animations/AnimatedContent';

interface StoryPreview {
  id: number;
  user_name: string;
  content: string;
  media_url: string;
  created_at: string;
  view_count: number;
  reaction_count: number;
}

interface GroupPreview {
  id: number;
  name: string;
  member_count: number;
  category: string;
  image_url: string;
}

interface EventPreview {
  id: number;
  title: string;
  date: string;
  location: string;
  attendee_count: number;
}

const COMMUNITY_CARDS = [
  { href: '/community/stories', emoji: '📸', title: 'Stories', desc: '24hr stories from island residents', color: 'from-violet-500 to-purple-600' },
  { href: '/community/groups', emoji: '👥', title: 'Groups', desc: 'Join communities that share your interests', color: 'from-blue-500 to-cyan-600' },
  { href: '/community/events', emoji: '🎉', title: 'Events', desc: 'Discover what\'s happening on the island', color: 'from-amber-500 to-orange-600' },
  { href: '/community/marketplace', emoji: '🛍️', title: 'Marketplace', desc: 'Buy and sell with your neighbors', color: 'from-emerald-500 to-teal-600' },
  { href: '/community/business', emoji: '🏢', title: 'Business', desc: 'Connect with local entrepreneurs', color: 'from-rose-500 to-pink-600' },
  { href: '/community/jobs', emoji: '💼', title: 'Jobs', desc: 'Find work or hire talent', color: 'from-indigo-500 to-blue-600' },
  { href: '/community/auctions', emoji: '🔨', title: 'Auctions', desc: 'Bid on unique island items', color: 'from-yellow-500 to-amber-600' },
  { href: '/community/coops', emoji: '🤝', title: 'Cooperatives', desc: 'Join forces with fellow business owners', color: 'from-teal-500 to-emerald-600' },
  { href: '/community/map', emoji: '🗺️', title: 'Island Map', desc: 'Explore businesses and services near you', color: 'from-cyan-500 to-blue-600' },
];

export default function CommunityFeedPage() {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<StoryPreview[]>([]);
  const [groups, setGroups] = useState<GroupPreview[]>([]);
  const [events, setEvents] = useState<EventPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const [storiesRes, groupsRes, eventsRes] = await Promise.allSettled([
          api.get('/stories/feed?limit=6'),
          api.get('/groups?limit=6'),
          api.get('/events/upcoming?limit=6'),
        ]);

        if (storiesRes.status === 'fulfilled') {
          const data = storiesRes.value.data;
          setStories(Array.isArray(data) ? data : data?.stories || []);
        }
        if (groupsRes.status === 'fulfilled') {
          const data = groupsRes.value.data;
          setGroups(Array.isArray(data) ? data : data?.groups || getSampleGroups());
        }
        if (eventsRes.status === 'fulfilled') {
          const data = eventsRes.value.data;
          setEvents(Array.isArray(data) ? data : data?.events || getSampleEvents());
        }
      } catch {
        setGroups(getSampleGroups());
        setEvents(getSampleEvents());
      }
      setLoading(false);
    };
    fetchFeed();
  }, []);

  return (
    <main className="min-h-screen bg-surface-primary">
      {/* Hero with Aurora */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 z-0">
          <Aurora
            colorStops={['#5b21b6', '#7c3aed', '#4c1d95']}
            amplitude={1.5}
            blend={0.35}
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-[1]" />

        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-2 bg-surface-elevated/10 backdrop-blur-xl rounded-full text-accent-300 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10"
          >
            Island Community 🌴
          </motion.div>
          <BlurText
            text="Your Island, Your Community"
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter justify-center"
            delay={120}
            direction="top"
            animateBy="words"
          />
          <AnimatedContent distance={20} delay={0.4}>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto font-medium">
              Connect, share, and grow with fellow islanders. Stories, groups, events, and more.
            </p>
          </AnimatedContent>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Community Cards Grid */}
        <AnimatedContent distance={40}>
          <section>
            <h2 className="text-xl font-black text-ink-primary mb-4">Explore Community</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {COMMUNITY_CARDS.map((card, i) => (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={card.href}
                    className={`block bg-gradient-to-br ${card.color} rounded-2xl p-4 sm:p-5 text-white hover:scale-[1.02] hover:shadow-xl transition-all group`}
                  >
                    <span className="text-2xl sm:text-3xl block mb-2 group-hover:scale-110 transition-transform">{card.emoji}</span>
                    <h3 className="text-sm sm:text-base font-black tracking-tight">{card.title}</h3>
                    <p className="text-[10px] sm:text-xs text-white/70 mt-1 leading-snug">{card.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </AnimatedContent>

        {/* Latest Stories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-ink-primary">Latest Stories</h2>
            <Link href="/community/stories" className="text-xs font-bold text-accent-500 hover:underline uppercase tracking-wider">View All</Link>
          </div>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shrink-0 w-28 h-36 bg-surface-tertiary rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/community/stories#story-${story.id}`}
                  className="shrink-0 w-28 flex flex-col items-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 p-0.5 mb-2">
                    <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center text-2xl overflow-hidden">
                      {story.media_url ? (
                        <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>📸</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-ink-secondary text-center truncate w-full">{story.user_name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-surface-secondary/50 rounded-2xl border border-border-primary">
              <span className="text-3xl block mb-2">📸</span>
              <p className="text-sm font-bold text-ink-secondary">No stories yet</p>
              <p className="text-xs text-ink-tertiary">Be the first to share your story!</p>
            </div>
          )}
        </section>

        {/* Active Groups */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-ink-primary">Active Groups</h2>
            <Link href="/community/groups" className="text-xs font-bold text-accent-500 hover:underline uppercase tracking-wider">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.slice(0, 6).map((group) => (
              <Link
                key={group.id}
                href={`/community/groups#group-${group.id}`}
                className="flex items-center gap-3 p-3 bg-surface-elevated rounded-xl border border-border-primary hover:border-accent-500/30 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {group.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink-primary truncate group-hover:text-accent-500 transition-colors">{group.name}</p>
                  <p className="text-[10px] text-ink-tertiary">{group.member_count} members</p>
                </div>
                <span className="text-[9px] font-bold text-ink-tertiary uppercase tracking-wider px-2 py-1 bg-surface-secondary rounded-md">{group.category}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-ink-primary">Upcoming Events</h2>
            <Link href="/community/events" className="text-xs font-bold text-accent-500 hover:underline uppercase tracking-wider">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {events.slice(0, 4).map((event) => (
              <Link
                key={event.id}
                href={`/community/events#event-${event.id}`}
                className="p-4 bg-surface-elevated rounded-xl border border-border-primary hover:border-accent-500/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent-500/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-accent-500 uppercase">
                      {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black text-accent-500 leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-primary truncate group-hover:text-accent-500 transition-colors">{event.title}</p>
                    <p className="text-[10px] text-ink-tertiary mt-0.5">📍 {event.location}</p>
                    <p className="text-[10px] text-ink-tertiary">{event.attendee_count} attending</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Cooperatives CTA */}
        <section>
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Join a Cooperative</h3>
                <p className="text-white/70 text-sm mt-1">Team up with fellow business owners to grow together, share resources, and access bulk pricing.</p>
              </div>
              <Link
                href="/community/coops"
                className="px-6 py-3 bg-white text-teal-700 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/90 transition-all text-center shrink-0"
              >
                Explore Co-ops
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getSampleGroups(): GroupPreview[] {
  return [
    { id: 1, name: 'St. Kitts Foodies', member_count: 342, category: 'Food', image_url: '' },
    { id: 2, name: 'SKN Bridge Trade', member_count: 189, category: 'Trade', image_url: '' },
    { id: 3, name: 'Island Explorers', member_count: 256, category: 'Tours', image_url: '' },
    { id: 4, name: 'Caribbean Artists', member_count: 98, category: 'Art', image_url: '' },
    { id: 5, name: 'Beach Cleanup Crew', member_count: 167, category: 'Environment', image_url: '' },
    { id: 6, name: 'Local Entrepreneurs', member_count: 234, category: 'Business', image_url: '' },
  ];
}

function getSampleEvents(): EventPreview[] {
  return [
    { id: 1, title: 'Beach Cleanup Day', date: '2026-07-20', location: 'South Friars Bay', attendee_count: 45 },
    { id: 2, title: 'Food Festival', date: '2026-07-25', location: 'Basseterre', attendee_count: 120 },
    { id: 3, title: 'Networking Mixer', date: '2026-07-18', location: 'St. Kitts Marriott', attendee_count: 35 },
    { id: 4, title: 'Sunset Yoga', date: '2026-07-15', location: 'West Beach', attendee_count: 28 },
  ];
}

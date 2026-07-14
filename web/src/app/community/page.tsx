'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Send, Smile, Image, Video, MapPin, Globe, Lock,
  ChevronLeft, ChevronRight, X, Play, Pause
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────

interface Story {
  id: number;
  user_id: number;
  user_name: string;
  profile_photo_url: string;
  media_url: string;
  media_type: 'image' | 'video';
  content: string;
  created_at: string;
  is_viewed: boolean;
}

interface FeedPost {
  id: number;
  type: 'post' | 'shared_event' | 'shared_group' | 'shared_auction';
  user_id: number;
  user_name: string;
  profile_photo_url: string;
  content: string;
  media_urls: string[];
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  is_liked: boolean;
  is_saved: boolean;
  comments?: FeedComment[];
  tags?: string[];
  location?: string;
  group_name?: string;
  event_name?: string;
}

interface FeedComment {
  id: number;
  user_id: number;
  user_name: string;
  profile_photo_url: string;
  content: string;
  created_at: string;
  like_count: number;
}

// ─── Sample Data ──────────────────────────────────────

const SAMPLE_STORIES: Story[] = [
  { id: 1, user_id: 1, user_name: 'Your Story', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Create a story', created_at: new Date().toISOString(), is_viewed: false },
  { id: 2, user_id: 2, user_name: 'Maria Santos', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Sunset at South Friars Bay! 🌅', created_at: new Date(Date.now() - 3600000).toISOString(), is_viewed: false },
  { id: 3, user_id: 3, user_name: 'James Wilson', profile_photo_url: '', media_url: '', media_type: 'image', content: 'New catch of the day!', created_at: new Date(Date.now() - 7200000).toISOString(), is_viewed: true },
  { id: 4, user_id: 4, user_name: 'Sarah Chen', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Handmade jewelry launch 🎉', created_at: new Date(Date.now() - 10800000).toISOString(), is_viewed: false },
  { id: 5, user_id: 5, user_name: 'Mike Rivera', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Surf check 🌊', created_at: new Date(Date.now() - 14400000).toISOString(), is_viewed: false },
  { id: 6, user_id: 6, user_name: 'Ana Paul', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Farmers market haul', created_at: new Date(Date.now() - 18000000).toISOString(), is_viewed: false },
  { id: 7, user_id: 7, user_name: 'David King', profile_photo_url: '', media_url: '', media_type: 'image', content: 'Live music tonight!', created_at: new Date(Date.now() - 21600000).toISOString(), is_viewed: true },
];

const SAMPLE_POSTS: FeedPost[] = [
  {
    id: 1, type: 'post', user_id: 2, user_name: 'Maria Santos', profile_photo_url: '', content: 'Just launched my new line of handmade coconut jewelry! 🌴✨ Each piece is crafted with love using locally sourced materials. Check out my store for the full collection!\n\n#SupportLocal #CaribbeanMade #HandmadeWithLove',
    media_urls: [], created_at: new Date(Date.now() - 1800000).toISOString(),
    like_count: 142, comment_count: 23, share_count: 12, is_liked: false, is_saved: false, location: 'Basseterre, St. Kitts',
    tags: ['#SupportLocal', '#CaribbeanMade', '#HandmadeWithLove'],
    comments: [
      { id: 1, user_id: 3, user_name: 'James Wilson', profile_photo_url: '', content: 'These are beautiful! How do I order?', created_at: new Date(Date.now() - 900000).toISOString(), like_count: 5 },
      { id: 2, user_id: 5, user_name: 'Mike Rivera', profile_photo_url: '', content: 'My wife would love this! 🔥', created_at: new Date(Date.now() - 600000).toISOString(), like_count: 3 },
    ]
  },
  {
    id: 2, type: 'post', user_id: 4, user_name: 'Sarah Chen', profile_photo_url: '', content: 'Found the perfect spot for sunset yoga this evening 🧘‍♀️🌅 Join us at South Friars Bay at 5:30 PM — mats provided! All levels welcome.',
    media_urls: [], created_at: new Date(Date.now() - 3600000).toISOString(),
    like_count: 89, comment_count: 15, share_count: 8, is_liked: true, is_saved: false, location: 'South Friars Bay',
    tags: ['#Yoga', '#Wellness', '#StKitts'],
  },
  {
    id: 3, type: 'shared_event', user_id: 6, user_name: 'Ana Paul', profile_photo_url: '', content: 'Who\'s going to the Food Festival this weekend? 🍽️ I\'ll be there with my famous jerk chicken!',
    media_urls: [], created_at: new Date(Date.now() - 7200000).toISOString(),
    like_count: 234, comment_count: 45, share_count: 27, is_liked: false, is_saved: true, location: 'Downtown Market Plaza',
    event_name: 'Island Food Festival 2026',
  },
  {
    id: 4, type: 'post', user_id: 7, user_name: 'David King', profile_photo_url: '', content: 'Caught this beauty this morning! 🎣 45lb mahi-mahi off the west coast. Fresh fish for dinner tonight!',
    media_urls: [], created_at: new Date(Date.now() - 10800000).toISOString(),
    like_count: 312, comment_count: 56, share_count: 34, is_liked: false, is_saved: false, location: 'West Coast',
    tags: ['#Fishing', '#CaribbeanLife', '#FreshCatch'],
  },
  {
    id: 5, type: 'post', user_id: 3, user_name: 'James Wilson', profile_photo_url: '', content: 'Big thanks to IslandHub for helping me find the perfect vacation rental! 🙌 Amazing oceanfront villa with private pool. Highly recommend the platform for anyone looking to book on the island.',
    media_urls: [], created_at: new Date(Date.now() - 14400000).toISOString(),
    like_count: 67, comment_count: 12, share_count: 5, is_liked: false, is_saved: true, location: 'Frigate Bay',
  },
  {
    id: 6, type: 'shared_group', user_id: 5, user_name: 'Mike Rivera', profile_photo_url: '', content: 'New to the island and looking to meet people. Just joined the Water Sports Enthusiasts group — who\'s going surfing this weekend? 🏄‍♂️',
    media_urls: [], created_at: new Date(Date.now() - 21600000).toISOString(),
    like_count: 45, comment_count: 18, share_count: 3, is_liked: false, is_saved: false,
    group_name: 'Water Sports Enthusiasts',
  },
];

// ─── Helpers ──────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-teal-400 to-teal-600', 'from-amber-400 to-orange-500',
    'from-violet-400 to-purple-600', 'from-rose-400 to-pink-500',
    'from-cyan-400 to-blue-500', 'from-emerald-400 to-green-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Components ───────────────────────────────────────

function StoryCircle({ story, isFirst, onClick }: {
  story: Story; isFirst: boolean; onClick: () => void;
}) {
  const gradient = story.is_viewed
    ? 'border-white/30'
    : 'from-teal-400 via-cyan-400 to-amber-400';

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 shrink-0 group">
      <div className={`w-[68px] h-[68px] rounded-full bg-gradient-to-tr ${gradient} p-[3px] ${isFirst ? 'ring-2 ring-accent-400/30' : ''}`}>
        <div className={`w-full h-full rounded-full bg-surface-primary flex items-center justify-center overflow-hidden ${isFirst ? 'ring-2 ring-surface-primary' : ''}`}>
          {isFirst ? (
            <div className="flex items-center justify-center w-full h-full bg-accent-500/10">
              <Plus size={20} className="text-accent-400" />
            </div>
          ) : story.profile_photo_url ? (
            <img src={story.profile_photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(story.user_name)} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{getInitials(story.user_name)}</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] font-semibold text-ink-secondary truncate w-[72px] text-center">
        {isFirst ? 'Your Story' : story.user_name.split(' ')[0]}
      </span>
    </button>
  );
}

function StoryViewer({ stories, initialIndex, onClose }: {
  stories: Story[]; initialIndex: number; onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const current = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1.67; // ~3s total
      });
    }, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) { setCurrentIndex(c => c - 1); setProgress(0); }
  };
  const handleNext = () => {
    if (currentIndex < stories.length - 1) { setCurrentIndex(c => c + 1); setProgress(0); }
    else onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm h-[80vh]" onClick={e => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-1.5">
          {stories.slice(0, 5).map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* User info */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{getInitials(current.user_name)}</span>
              </div>
            </div>
            <div>
              <span className="text-white text-sm font-bold">{current.user_name}</span>
              <span className="text-white/60 text-xs ml-2">{timeAgo(current.created_at)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Story content */}
        <div className="w-full h-full rounded-2xl overflow-hidden bg-surface-elevated flex items-center justify-center">
          <div className="text-center p-8">
            {current.media_url ? (
              <img src={current.media_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(current.user_name)} mx-auto mb-6 flex items-center justify-center`}>
                  <span className="text-white text-3xl font-black">{getInitials(current.user_name)}</span>
                </div>
                <p className="text-white text-xl font-bold leading-relaxed max-w-xs mx-auto">{current.content}</p>
              </>
            )}
          </div>
        </div>

        {/* Nav buttons */}
        <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
}

function CreatePostBar({ user, onSubmit }: { user: any; onSubmit: (content: string) => void }) {
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
      setExpanded(false);
    }
  };

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name || 'You')} flex items-center justify-center shrink-0`}>
            <span className="text-white text-xs font-bold">{getInitials(user?.name || 'You')}</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            className="flex-1 bg-surface-secondary border border-border-primary rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400/30 transition-all"
          />
        </div>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 pt-3 border-t border-border-primary"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-secondary text-ink-secondary text-xs font-semibold transition-colors">
                  <Image size={16} className="text-emerald-400" /> Photo
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-secondary text-ink-secondary text-xs font-semibold transition-colors">
                  <Video size={16} className="text-violet-400" /> Video
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-secondary text-ink-secondary text-xs font-semibold transition-colors">
                  <MapPin size={16} className="text-rose-400" /> Location
                </button>
              </div>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-5 py-1.5 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Post
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}

function FeedPostCard({ post, onLike, onSave }: {
  post: FeedPost; onLike: (id: number) => void; onSave: (id: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [saved, setSaved] = useState(post.is_saved);
  const [liking, setLiking] = useState(false);

  const handleLike = () => {
    setLiking(true);
    if (liked) { setLiked(false); setLikeCount(c => c - 1); }
    else { setLiked(true); setLikeCount(c => c + 1); }
    onLike(post.id);
    setTimeout(() => setLiking(false), 300);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave(post.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link href={`/profile/${post.user_id}`} className="flex items-center gap-3 group">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(post.user_name)} p-[2px] shrink-0`}>
            <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center">
              {post.profile_photo_url ? (
                <img src={post.profile_photo_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[10px] font-bold">{getInitials(post.user_name)}</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink-primary group-hover:text-accent-400 transition-colors">{post.user_name}</span>
              {post.location && (
                <span className="text-[9px] text-ink-tertiary">• {post.location}</span>
              )}
            </div>
            <span className="text-[11px] text-ink-tertiary">{timeAgo(post.created_at)}</span>
          </div>
        </Link>
        <button className="p-1.5 hover:bg-surface-secondary rounded-lg text-ink-tertiary transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Shared event/group badge */}
      {post.type === 'shared_event' && post.event_name && (
        <div className="mx-4 mb-2 px-3 py-2 bg-accent-500/5 rounded-xl border border-accent-500/10 flex items-center gap-2">
          <Calendar size={14} className="text-accent-400 shrink-0" />
          <span className="text-xs font-semibold text-accent-400">{post.event_name}</span>
          <Link href="/community/events" className="ml-auto text-[10px] font-bold text-accent-500 hover:underline">See event</Link>
        </div>
      )}
      {post.type === 'shared_group' && post.group_name && (
        <div className="mx-4 mb-2 px-3 py-2 bg-violet-500/5 rounded-xl border border-violet-500/10 flex items-center gap-2">
          <Users size={14} className="text-violet-400 shrink-0" />
          <span className="text-xs font-semibold text-violet-400">{post.group_name}</span>
          <Link href="/community/groups" className="ml-auto text-[10px] font-bold text-violet-500 hover:underline">View group</Link>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-line">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map(tag => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="text-xs font-semibold text-accent-400 hover:text-accent-500 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Media grid */}
      {post.media_urls.length > 0 && (
        <div className={`px-4 pb-2 ${post.media_urls.length === 1 ? '' : 'grid grid-cols-2 gap-1'}`}>
          {post.media_urls.map((url, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-surface-secondary aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary/50">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {[1, 2, 3].slice(0, Math.min(3, post.like_count > 0 ? 3 : 0)).map(i => (
              <div key={i} className="w-4 h-4 rounded-full bg-accent-500 flex items-center justify-center ring-2 ring-surface-elevated">
                <Heart size={8} className="text-white" fill="white" />
              </div>
            ))}
          </div>
          <span className="text-xs text-ink-tertiary font-semibold">{likeCount.toLocaleString()} likes</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-tertiary font-semibold">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-ink-primary transition-colors">
            {post.comment_count} comments
          </button>
          <span>{post.share_count} shares</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-around px-2 py-1">
        <button onClick={handleLike} className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg hover:bg-surface-secondary transition-colors ${liked ? 'text-rose-500' : 'text-ink-tertiary'}`}>
          <motion.div animate={{ scale: liking ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          </motion.div>
          <span className="text-xs font-bold">{liked ? 'Liked' : 'Like'}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg hover:bg-surface-secondary text-ink-tertiary transition-colors">
          <MessageCircle size={20} />
          <span className="text-xs font-bold">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg hover:bg-surface-secondary text-ink-tertiary transition-colors">
          <Share2 size={20} />
          <span className="text-xs font-bold">Share</span>
        </button>
        <button onClick={handleSave} className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg hover:bg-surface-secondary transition-colors ${saved ? 'text-accent-500' : 'text-ink-tertiary'}`}>
          <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
          <span className="text-xs font-bold">{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && post.comments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-primary/50 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(comment.user_name)} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className="text-white text-[8px] font-bold">{getInitials(comment.user_name)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-surface-secondary rounded-xl px-3 py-2">
                      <Link href={`/profile/${comment.user_id}`} className="text-xs font-bold text-ink-primary hover:underline">{comment.user_name}</Link>
                      <p className="text-xs text-ink-secondary mt-0.5">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-2">
                      <button className="text-[10px] font-semibold text-ink-tertiary hover:text-ink-primary">Like</button>
                      <button className="text-[10px] font-semibold text-ink-tertiary hover:text-ink-primary">Reply</button>
                      <span className="text-[10px] text-ink-tertiary">{timeAgo(comment.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Comment input */}
              <div className="flex items-center gap-2 pt-1">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor('You')} flex items-center justify-center shrink-0`}>
                  <span className="text-white text-[8px] font-bold">{getInitials('You')}</span>
                </div>
                <div className="flex-1 flex items-center bg-surface-secondary rounded-xl px-3 py-1.5">
                  <input type="text" placeholder="Write a comment..." className="flex-1 bg-transparent text-xs text-ink-primary placeholder:text-ink-tertiary outline-none" />
                  <div className="flex items-center gap-1 ml-2">
                    <button className="p-1 hover:bg-surface-secondary rounded"><Smile size={14} className="text-ink-tertiary" /></button>
                    <button className="p-1 hover:bg-surface-secondary rounded"><Send size={14} className="text-accent-400" /></button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RightSidebar() {
  return (
    <aside className="hidden xl:block w-[300px] shrink-0 space-y-4">
      {/* Suggested groups */}
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-tertiary">Suggested Groups</h3>
          <Link href="/community/groups" className="text-[10px] font-bold text-accent-500 hover:underline">See All</Link>
        </div>
        {[
          { name: 'St. Kitts Foodies', members: '1.2k members', icon: '🍽️' },
          { name: 'Water Sports', members: '890 members', icon: '🏄' },
          { name: 'Local Business Network', members: '567 members', icon: '💼' },
        ].map(group => (
          <Link key={group.name} href="/community/groups" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-secondary transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-lg shrink-0">
              {group.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink-primary truncate">{group.name}</p>
              <p className="text-[10px] text-ink-tertiary">{group.members}</p>
            </div>
            <button className="px-3 py-1 bg-accent-500/10 text-accent-500 rounded-lg text-[10px] font-bold hover:bg-accent-500/20 transition-colors">Join</button>
          </Link>
        ))}
      </div>

      {/* Trending topics */}
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-ink-tertiary mb-3">Trending on IslandHub</h3>
        {['#FoodFest2026', '#CaribbeanMade', '#BeachCleanup', '#SunsetYoga', '#LocalArt'].map(tag => (
          <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="block px-2 py-1.5 rounded-lg hover:bg-surface-secondary text-xs font-semibold text-accent-400 transition-colors">
            {tag}
          </Link>
        ))}
      </div>

      {/* Footer links */}
      <div className="px-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-ink-tertiary">
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link href="/help" className="hover:underline">Help</Link>
        </div>
        <p className="text-[10px] text-ink-tertiary/50 mt-2">© 2026 IslandHub Community</p>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────

export default function CommunityFeedPage() {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORIES);
  const [posts, setPosts] = useState<FeedPost[]>(SAMPLE_POSTS);
  const [loading, setLoading] = useState(true);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [storiesRes, postsRes] = await Promise.allSettled([
          api.get('/stories/feed'),
          api.get('/community/feed?limit=20'),
        ]);
        if (storiesRes.status === 'fulfilled') {
          const data = storiesRes.value.data;
          if (data) setStories(Array.isArray(data) ? data : data.stories || SAMPLE_STORIES);
        }
        if (postsRes.status === 'fulfilled') {
          const data = postsRes.value.data;
          if (data) setPosts(Array.isArray(data) ? data : data.posts || SAMPLE_POSTS);
        }
      } catch { /* use sample data */ }
      setLoading(false);
    };
    fetchFeed();
  }, []);

  const handleStoryClick = (index: number) => {
    setStoryIndex(index);
    setStoryViewerOpen(true);
  };

  const handleLike = (postId: number) => {
    api.post(`/community/posts/${postId}/like`).catch(() => {});
  };

  const handleSave = (postId: number) => {
    api.post(`/community/posts/${postId}/save`).catch(() => {});
  };

  const handleCreatePost = (content: string) => {
    const newPost: FeedPost = {
      id: Date.now(), type: 'post', user_id: user?.id || 999,
      user_name: user?.name || 'You', profile_photo_url: user?.avatar_url || '',
      content, media_urls: [], created_at: new Date().toISOString(),
      like_count: 0, comment_count: 0, share_count: 0,
      is_liked: false, is_saved: false,
    };
    setPosts([newPost, ...posts]);
    api.post('/community/posts', { content }).catch(() => {});
  };

  return (
    <main className="min-h-screen bg-surface-primary">
      {/* Top spacing for the fixed top bar */}
      <div className="h-0" />

      <div className="max-w-[1280px] mx-auto flex gap-6 px-4 py-4">
        {/* Left sidebar - hidden on mobile, visible on lg */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-20 space-y-1">
            <Link href="/community" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent-500/10 text-accent-500 font-bold">
              <Home size={20} />
              <span className="text-sm">Feed</span>
            </Link>
            {[
              { href: '/community/stories', label: 'Stories', icon: '📸' as const },
              { href: '/community/groups', label: 'Groups', icon: '👥' as const },
              { href: '/community/events', label: 'Events', icon: '🎉' as const },
              { href: '/community/marketplace', label: 'Marketplace', icon: '🛍️' as const },
              { href: '/community/auctions', label: 'Auctions', icon: '🔨' as const },
              { href: '/community/business', label: 'Business', icon: '💼' as const },
              { href: '/community/jobs', label: 'Jobs', icon: '💼' as const },
              { href: '/community/messages', label: 'Messages', icon: '💬' as const },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}

            <div className="pt-4 mt-2 border-t border-border-primary">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2">Your Shortcuts</p>
              {[
                { label: 'SKN Bridge Trade', emoji: '🌉' },
                { label: 'St. Kitts Foodies', emoji: '🍽️' },
                { label: 'Island Events', emoji: '📅' },
              ].map(sc => (
                <Link key={sc.label} href="/community/groups"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center text-sm">
                    {sc.emoji}
                  </div>
                  <span className="text-xs font-medium truncate">{sc.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main feed */}
        <div className="flex-1 min-w-0 max-w-[640px] mx-auto lg:mx-0 space-y-4">
          {/* Stories row */}
          <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {stories.map((story, i) => (
                <StoryCircle key={story.id} story={story} isFirst={i === 0} onClick={() => handleStoryClick(i)} />
              ))}
            </div>
          </div>

          {/* Create post bar */}
          <CreatePostBar user={user} onSubmit={handleCreatePost} />

          {/* Feed tabs */}
          <div className="flex items-center gap-1 bg-surface-elevated rounded-xl border border-border-primary p-1">
            <button onClick={() => setActiveTab('for_you')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'for_you' ? 'bg-accent-500 text-white shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'}`}>
              For You
            </button>
            <button onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'following' ? 'bg-accent-500 text-white shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'}`}>
              Following
            </button>
          </div>

          {/* Post feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-tertiary" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-surface-tertiary rounded w-1/3" />
                      <div className="h-2 bg-surface-secondary rounded w-1/5" />
                    </div>
                  </div>
                  <div className="h-3 bg-surface-tertiary rounded w-3/4" />
                  <div className="h-3 bg-surface-tertiary rounded w-1/2" />
                  <div className="h-48 bg-surface-tertiary rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <FeedPostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar - trending */}
        <RightSidebar />
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {storyViewerOpen && (
          <StoryViewer stories={stories} initialIndex={storyIndex} onClose={() => setStoryViewerOpen(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

// ─── Missing imports for lucide icons used in template ──
import { Home, Users, Calendar } from 'lucide-react';
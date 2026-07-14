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
  ChevronLeft, ChevronRight, X, Play, Pause, Plus,
  Home, Users, Calendar, MessageCircle as MessageCircleIcon,
  ShoppingBag, Gavel, Building2, Briefcase, MapPin as MapPinIcon,
  Sparkles, Bell, Search, Menu, User, Settings, LogOut,
  Bookmark as BookmarkIcon, Flag, EllipsisVertical
} from 'lucide-react';
import { useFeedPosts, useStoriesFeed, useGroups, useCommunityEvents } from '@/lib/hooks/use-swr';

// ─── Types ────────────────────────────────────────────

interface Story {
  story_id: number;
  user_id: number;
  user_name: string;
  user_photo: string;
  media_url: string;
  media_type: string;
  caption: string;
  expires_at: string;
  view_count: number;
  user_viewed?: boolean;
  created_at: string;
}

interface StoryGroup {
  user_id: number;
  user_name: string;
  user_photo: string;
  stories: Story[];
}

interface FeedPost {
  post_id: number;
  user_id: number;
  user_name: string;
  profile_photo_url: string;
  title: string;
  content: string;
  media_url: string;
  media_type: string;
  category: string;
  visibility: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  media?: string[];
}

interface Group {
  group_id: number;
  name: string;
  slug: string;
  description: string;
  privacy: string;
  category: string;
  cover_image_url: string;
  avatar_url: string;
  owner_name: string;
  member_count: number;
  is_member?: boolean;
  user_role?: string;
}

interface CommunityEvent {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  category: string;
  cover_image_url: string;
  organizer_name: string;
  attendee_count: number;
  is_rsvped?: boolean;
  created_at: string;
}

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

function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'http://localhost:5001' : '') : '';
  return `${base}/api/media/file/${url.startsWith('/') ? url.slice(1) : url}`;
}

// ─── Components ───────────────────────────────────────

function StoryCircle({ storyGroup, isFirst, onClick }: { storyGroup: StoryGroup; isFirst: boolean; onClick: () => void }) {
  const firstStory = storyGroup.stories[0];
  const isViewed = firstStory.user_viewed;

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 shrink-0 group">
      <div className={`w-[68px] h-[68px] rounded-full bg-gradient-to-tr ${isViewed ? 'border-white/30' : 'from-teal-400 via-cyan-400 to-amber-400'} p-[3px] ${isFirst ? 'ring-2 ring-accent-400/30' : ''}`}>
        <div className={`w-full h-full rounded-full bg-surface-primary flex items-center justify-center overflow-hidden ${isFirst ? 'ring-2 ring-surface-primary' : ''}`}>
          {isFirst ? (
            <div className="flex items-center justify-center w-full h-full bg-accent-500/10">
              <Plus size={20} className="text-accent-400" />
            </div>
          ) : firstStory.user_photo ? (
            <img src={getImageUrl(firstStory.user_photo)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(storyGroup.user_name)} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{getInitials(storyGroup.user_name)}</span>
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] font-semibold text-secondary truncate w-[72px] text-center">
        {isFirst ? 'Your Story' : storyGroup.user_name.split(' ')[0]}
      </span>
    </button>
  );
}

function StoryViewer({ storyGroups, initialGroupIndex, initialStoryIndex, onClose, onPrevGroup, onNextGroup }: {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
  onPrevGroup: () => void;
  onNextGroup: () => void;
}) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [replyText, setReplyText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const touchStartX = useRef(0);

  const currentGroup = storyGroups[groupIdx];
  const currentStory = currentGroup?.stories[storyIdx];

  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    setLiked(false);
    setReplyText('');

    const tick = () => {
      progressRef.current += 1.67;
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        if (storyIdx < currentGroup.stories.length - 1) {
          setStoryIdx(s => s + 1);
        } else {
          onNextGroup();
        }
      }
    };

    if (!paused) {
      intervalRef.current = setInterval(tick, 50);
    }

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [groupIdx, storyIdx, paused]);

  const handlePrev = () => {
    if (storyIdx > 0) { setStoryIdx(s => s - 1); setProgress(0); }
    else onPrevGroup();
  };

  const handleNext = () => {
    if (storyIdx < currentGroup.stories.length - 1) { setStoryIdx(s => s + 1); setProgress(0); }
    else onClose();
  };

  const handleLike = () => { setLiked(!liked); api.post(`/stories/${currentStory?.story_id}/react`).catch(() => {}); };
  const handleReply = (e: React.FormEvent) => { e.preventDefault(); if (replyText.trim()) { api.post(`/stories/${currentStory?.story_id}/reply`, { message: replyText.trim() }).catch(() => {}); setReplyText(''); } };
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => { const diff = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(diff) > 50) { if (diff > 0) handlePrev(); else handleNext(); } };

  if (!currentStory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm h-[80vh]" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-1.5">
          {storyGroups.slice(0, 5).map((group, gi) => (
            <div key={gi} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              {group.stories.map((_, si) => (
                <div key={si} className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: gi < groupIdx || (gi === groupIdx && si < storyIdx) ? '100%' : gi === groupIdx && si === storyIdx ? `${progress}%` : '0%' }} />
              ))}
            </div>
          ))}
        </div>

        {/* User info */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{getInitials(currentGroup.user_name)}</span>
              </div>
            </div>
            <div>
              <span className="text-white text-sm font-bold block">{currentGroup.user_name}</span>
              <span className="text-white/60 text-xs">{timeAgo(currentStory.created_at)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Story content */}
        <div className="w-full h-full rounded-2xl overflow-hidden bg-surface-elevated flex items-center justify-center cursor-pointer" onClick={() => setPaused(!paused)}>
          <div className="w-full h-full flex items-center justify-center relative">
            {currentStory.media_url ? (
              currentStory.media_type === 'video' ? (
                <video src={getImageUrl(currentStory.media_url)} className="w-full h-full object-cover" muted={muted} playsInline />
              ) : (
                <img src={getImageUrl(currentStory.media_url)} alt="" className="w-full h-full object-cover" />
              )
            ) : (
              <>
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(currentGroup.user_name)} mx-auto mb-6 flex items-center justify-center`}>
                  <span className="text-white text-3xl font-black">{getInitials(currentGroup.user_name)}</span>
                </div>
                <p className="text-white text-xl font-bold leading-relaxed max-w-xs mx-auto">{currentStory.caption}</p>
              </>
            )}
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

        {/* Nav buttons */}
        <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-1 z-20 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors opacity-0 hover:opacity-100">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-1 z-20 p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors opacity-0 hover:opacity-100">
          <ChevronRight size={20} className="text-white" />
        </button>

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
            className="flex-1 bg-surface-secondary border border-border-primary rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400/30 transition-all"
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
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-secondary text-secondary text-xs font-semibold transition-colors">
                  <Image size={16} className="text-emerald-400" /> Photo
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-secondary text-secondary text-xs font-semibold transition-colors">
                  <Video size={16} className="text-violet-400" /> Video
                </button>
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-secondary text-secondary text-xs font-semibold transition-colors">
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

function FeedPostCard({ post, onLike, onSave }: { post: FeedPost; onLike: (id: number) => void; onSave: (id: number) => void }) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [saved, setSaved] = useState(post.is_bookmarked);
  const [liking, setLiking] = useState(false);

  const handleLike = () => {
    setLiking(true);
    if (liked) { setLiked(false); setLikeCount(c => c - 1); }
    else { setLiked(true); setLikeCount(c => c + 1); }
    onLike(post.post_id);
    setTimeout(() => setLiking(false), 300);
  };

  const handleSave = () => { setSaved(!saved); onSave(post.post_id); };

  const mediaUrls = post.media || (post.media_url ? [post.media_url] : []);

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
            <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden">
              {post.profile_photo_url ? (
                <img src={getImageUrl(post.profile_photo_url)} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-[10px] font-bold">{getInitials(post.user_name)}</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary group-hover:text-accent-400 transition-colors">{post.user_name}</span>
            </div>
            <span className="text-[11px] text-tertiary">{timeAgo(post.created_at)}</span>
          </div>
        </Link>
        <button className="p-1.5 hover:bg-surface-secondary rounded-lg text-tertiary transition-colors">
          <EllipsisVertical size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-sm text-primary leading-relaxed whitespace-pre-line">{post.content || post.title}</p>
      </div>

      {/* Media grid */}
      {mediaUrls.length > 0 && (
        <div className={`px-4 pb-2 ${mediaUrls.length === 1 ? '' : 'grid grid-cols-2 gap-1'}`}>
          {mediaUrls.map((url, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-surface-secondary aspect-square">
              <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary/50">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {[1, 2, 3].slice(0, Math.min(3, likeCount > 0 ? 3 : 0)).map(i => (
              <div key={i} className="w-4 h-4 rounded-full bg-accent-500 flex items-center justify-center ring-2 ring-surface-elevated">
                <Heart size={8} className="text-white" fill="white" />
              </div>
            ))}
          </div>
          <span className="text-xs text-tertiary font-semibold">{likeCount.toLocaleString()} likes</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-tertiary font-semibold">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-primary transition-colors">
            {post.comments_count} comments
          </button>
          <button onClick={handleSave} className="hover:text-primary transition-colors">
            <BookmarkIcon size={16} className={saved ? 'fill-current text-accent-500' : ''} />
          </button>
          <button onClick={handleLike} className={liking ? 'animate-pulse' : ''} disabled={liking}>
            <Heart size={16} className={liked ? 'fill-current text-accent-500' : ''} />
          </button>
          <button className="hover:text-primary transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 border-t border-border-primary/50 bg-surface-secondary/50"
          >
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {/* Comments would be fetched here */}
              <p className="text-xs text-tertiary text-center py-2">Tap to view comments</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Community Page ────────────────────────────

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIdx, setViewerGroupIdx] = useState(0);
  const [viewerStoryIdx, setViewerStoryIdx] = useState(0);

  // Fetch real data from API
  const { data: posts = [], isLoading: postsLoading, error: postsError, mutate: mutatePosts } = useFeedPosts({ limit: 20 });
  const { data: storiesFeed = [], isLoading: storiesLoading } = useStoriesFeed();
  const { data: groups = [], isLoading: groupsLoading } = useGroups({ limit: 10 });
  const { data: events = [], isLoading: eventsLoading } = useCommunityEvents({ limit: 10 });

  // Transform stories feed into groups
  useEffect(() => {
    if (storiesFeed.length > 0) {
      setStoryGroups(storiesFeed);
    }
  }, [storiesFeed]);

  const handleCreatePost = async (content: string) => {
    try {
      const res = await api.post('/community/posts', { content });
      mutatePosts();
    } catch (e) {
      console.error('Failed to create post:', e);
    }
  };

  const handleLike = (postId: number) => {
    api.post(`/community/posts/${postId}/like`).catch(() => {});
  };

  const handleSave = (postId: number) => {
    api.post(`/community/posts/${postId}/bookmark`).catch(() => {});
  };

  const openStoryViewer = (groupIndex: number, storyIndex = 0) => {
    setViewerGroupIdx(groupIndex);
    setViewerStoryIdx(storyIndex);
    setViewerOpen(true);
  };

  const handlePrevGroup = () => {
    if (viewerGroupIdx > 0) {
      setViewerGroupIdx(g => g - 1);
      setViewerStoryIdx(0);
    }
  };

  const handleNextGroup = () => {
    if (viewerGroupIdx < storyGroups.length - 1) {
      setViewerGroupIdx(g => g + 1);
      setViewerStoryIdx(0);
    } else {
      setViewerOpen(false);
    }
  };

  // Combine "Your Story" with fetched stories
  const allStoryGroups: StoryGroup[] = [
    {
      user_id: user?.id || 0,
      user_name: user?.name || 'You',
      user_photo: user?.avatar_url || '',
      stories: []
    },
    ...storyGroups
  ];

  if (postsLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-tertiary">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Stories row */}
      <div className="border-b border-border-primary bg-surface-elevated/50 backdrop-blur-sm sticky top-14 z-30 lg:top-0 lg:border-b lg:bg-surface-elevated/50">
        <div className="max-w-[1280px] mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
            {allStoryGroups.slice(0, 8).map((group, idx) => (
              <StoryCircle
                key={group.user_id}
                storyGroup={group}
                isFirst={idx === 0}
                onClick={() => idx === 0 ? openStoryViewer(0, 0) : openStoryViewer(idx, 0)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Create post bar */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {user && <CreatePostBar user={user} onSubmit={handleCreatePost} />}
        {!user && (
          <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 text-center">
            <p className="text-secondary mb-3">Join the conversation</p>
            <div className="flex gap-2 justify-center">
              <Link href="/login" className="px-5 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors">Log in</Link>
              <Link href="/register" className="px-5 py-2.5 border border-border-primary text-secondary rounded-xl text-sm font-bold hover:bg-surface-secondary transition-colors">Sign up</Link>
            </div>
          </div>
        )}
      </div>

      {/* Feed tabs */}
      <div className="border-b border-border-primary sticky top-[calc(var(--navbar-height, 72px) + 120px)] z-20 bg-surface-primary/95 backdrop-blur-sm lg:top-[calc(var(--navbar-height, 72px) + 56px)]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'for-you' ? 'bg-accent-500/10 text-accent-500' : 'text-tertiary hover:text-secondary hover:bg-surface-secondary'
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'following' ? 'bg-accent-500/10 text-accent-500' : 'text-tertiary hover:text-secondary hover:bg-surface-secondary'
              }`}
            >
              Following
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20 lg:pb-0">
        {posts.length === 0 && !postsLoading ? (
          <div className="text-center py-12 bg-surface-elevated rounded-2xl border border-border-primary">
            <MessageCircleIcon size={48} className="mx-auto text-tertiary mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-primary mb-2">No posts yet</h3>
            <p className="text-tertiary text-sm">Be the first to share something with the community!</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {posts.map((post, idx) => (
                <FeedPostCard
                  key={post.post_id}
                  post={post}
                  onLike={handleLike}
                  onSave={handleSave}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                />
              ))}
            </AnimatePresence>

            {/* Suggested groups sidebar on desktop */}
            <div className="hidden lg:block mt-8">
              <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <Users size={16} className="text-accent-500" />
                Suggested Groups
              </h3>
              <div className="space-y-3">
                {groups.slice(0, 3).map(group => (
                  <Link
                    key={group.group_id}
                    href={`/community/groups/${group.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 bg-surface-elevated rounded-xl border border-border-primary hover:border-accent-500/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {group.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-primary truncate group-hover:text-accent-400 transition-colors">{group.name}</div>
                      <div className="text-[10px] text-tertiary flex items-center gap-1">
                        <Users size={10} /> {group.member_count.toLocaleString()} members
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Upcoming events */}
        {events.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Calendar size={16} className="text-accent-500" />
                Upcoming Events
              </h3>
              <Link href="/community/events" className="text-xs font-bold text-accent-500 hover:underline">See all</Link>
            </div>
            <div className="space-y-2">
              {events.slice(0, 3).map(event => (
                <Link
                  key={event.event_id}
                  href={`/community/events/${event.event_id}`}
                  className="flex items-center gap-3 px-3 py-2.5 bg-surface-elevated rounded-xl border border-border-primary hover:border-accent-500/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-primary truncate group-hover:text-accent-400 transition-colors">{event.title}</div>
                    <div className="text-[10px] text-tertiary flex items-center gap-1">
                      <MapPinIcon size={10} /> {event.location} · {timeAgo(event.event_date)}
                    </div>
                  </div>
                  {event.cover_image_url && (
                    <img src={getImageUrl(event.cover_image_url)} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && storyGroups.length > 0 && (
          <StoryViewer
            storyGroups={allStoryGroups}
            initialGroupIndex={viewerGroupIdx}
            initialStoryIndex={viewerStoryIdx}
            onClose={() => setViewerOpen(false)}
            onPrevGroup={handlePrevGroup}
            onNextGroup={handleNextGroup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
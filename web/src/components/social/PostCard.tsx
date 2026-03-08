'use client';
// refresh

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import LikeButton from './LikeButton';
import BookmarkButton from './BookmarkButton';
import CommentThread from './CommentThread';

interface Post {
    post_id: number;
    user_id: number;
    title: string;
    content: string;
    media_url: string | null;
    media_type: string | null;
    category: string | null;
    created_at: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    user_name: string;
    user_photo: string | null;
    user_liked?: boolean;
    user_bookmarked?: boolean;
}

interface PostCardProps {
    post: Post;
    showFullContent?: boolean;
}

export default function PostCard({ post, showFullContent = false }: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const loadComments = async () => {
        if (commentsLoaded) return;

        try {
            const response = await api.get(`/comments/post/${post.post_id}`);
            setComments(response.data.comments || []);
            setCommentsLoaded(true);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            loadComments();
        }
        setShowComments(!showComments);
    };

    const handleCommentAdded = (comment: any) => {
        if (comment.parent_id) {
            // It's a reply, find parent and add to replies
            setComments(prev => prev.map(c => {
                if (c.comment_id === comment.parent_id) {
                    return { ...c, replies: [...(c.replies || []), comment] };
                }
                return c;
            }));
        } else {
            // It's a top-level comment
            setComments(prev => [comment, ...prev]);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden"
        >
            {/* Header */}
            <div className="p-8 pb-0">
                <div className="flex items-center justify-between">
                    <Link href={`/community/profile/${post.user_id}`} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {post.user_photo ? (
                                <img src={post.user_photo} alt={post.user_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                post.user_name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-lg">{post.user_name}</h3>
                            <p className="text-sm text-slate-400">{formatDate(post.created_at)}</p>
                        </div>
                    </Link>

                    {post.category && (
                        <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-bold uppercase tracking-wider">
                            {post.category}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {post.title && (
                    <h2 className="text-2xl font-black text-slate-900 mb-4">{post.title}</h2>
                )}

                <p className={`text-slate-600 leading-relaxed ${!showFullContent && 'line-clamp-4'}`}>
                    {post.content}
                </p>

                {/* Media */}
                {post.media_url && (
                    <div className="mt-6 rounded-2xl overflow-hidden">
                        {post.media_type === 'video' ? (
                            <video
                                src={post.media_url}
                                controls
                                className="w-full max-h-96 object-cover"
                            />
                        ) : (
                            <img
                                src={post.media_url}
                                alt={post.title || 'Post media'}
                                className="w-full max-h-96 object-cover"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-8 pb-6 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LikeButton
                            postId={post.post_id}
                            initialLiked={post.user_liked || false}
                            initialCount={post.likes_count}
                        />

                        <button
                            onClick={handleToggleComments}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium">{post.comments_count}</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="font-medium">{post.shares_count}</span>
                        </button>
                    </div>

                    <BookmarkButton
                        postId={post.post_id}
                        initialBookmarked={post.user_bookmarked || false}
                    />
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-8 pb-8 border-t border-slate-100 pt-8">
                    <CommentThread
                        postId={post.post_id}
                        comments={comments}
                        onCommentAdded={handleCommentAdded}
                    />
                </div>
            )}
        </motion.article>
    );
}

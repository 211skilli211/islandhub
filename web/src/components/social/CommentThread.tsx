'use client';
// refresh

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import LikeButton from './LikeButton';

interface Comment {
    comment_id: number;
    post_id: number;
    user_id: number;
    parent_id: number | null;
    content: string;
    created_at: string;
    updated_at: string;
    is_edited: boolean;
    user_name: string;
    user_photo: string | null;
    likes_count: number;
    user_liked: boolean;
    replies: Comment[];
}

interface CommentThreadProps {
    postId: number;
    comments: Comment[];
    onCommentAdded?: (comment: Comment) => void;
}

export default function CommentThread({ postId, comments, onCommentAdded }: CommentThreadProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/comments', {
                post_id: postId,
                content: newComment
            });

            setNewComment('');
            onCommentAdded?.(response.data);
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (parentId: number) => {
        if (!replyContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/comments', {
                post_id: postId,
                parent_id: parentId,
                content: replyContent
            });

            setReplyContent('');
            setReplyingTo(null);
            onCommentAdded?.(response.data);
        } catch (error) {
            console.error('Failed to post reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const renderComment = (comment: Comment, isReply = false) => (
        <motion.div
            key={comment.comment_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isReply ? 'ml-12 mt-4' : ''}`}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <Link href={`/community/profile/${comment.user_id}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                        {comment.user_photo ? (
                            <img src={comment.user_photo} alt={comment.user_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            comment.user_name?.charAt(0).toUpperCase()
                        )}
                    </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 rounded-2xl px-4 py-3">
                        <Link href={`/community/profile/${comment.user_id}`} className="font-bold text-slate-900 hover:text-teal-600">
                            {comment.user_name}
                        </Link>
                        <p className="text-slate-700 mt-1 wrap-break-word">{comment.content}</p>
                        {comment.is_edited && (
                            <span className="text-xs text-slate-400">(edited)</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2 ml-2">
                        <LikeButton
                            postId={comment.comment_id}
                            initialLiked={comment.user_liked}
                            initialCount={comment.likes_count}
                            size="sm"
                            showLabel={false}
                        />

                        {!isReply && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}
                                className="text-xs font-bold text-slate-500 hover:text-teal-600 uppercase tracking-wide"
                            >
                                Reply
                            </button>
                        )}

                        <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                    </div>

                    {/* Reply Input */}
                    <AnimatePresence>
                        {replyingTo === comment.comment_id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3"
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:border-teal-500 focus:outline-none text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleReply(comment.comment_id)}
                                    />
                                    <button
                                        onClick={() => handleReply(comment.comment_id)}
                                        disabled={!replyContent.trim() || isSubmitting}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-bold uppercase hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nested Replies */}
                    {comment.replies?.map((reply) => renderComment(reply, true))}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Main Comment Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-5 py-3 rounded-full border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-6 py-3 bg-teal-600 text-white rounded-full font-bold uppercase tracking-wider hover:bg-teal-700 disabled:opacity-50 transition-all"
                >
                    {isSubmitting ? '...' : 'Post'}
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => renderComment(comment))}
            </div>

            {comments.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            )}
        </div>
    );
}

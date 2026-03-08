'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface LikeButtonProps {
    postId: number;
    initialLiked?: boolean;
    initialCount?: number;
    initialReaction?: string;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    showLabel?: boolean;
}

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Laugh' },
    { type: 'surprised', emoji: '😮', label: 'Surprised' },
    { type: 'thinking', emoji: '🤔', label: 'Thinking' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
];

export default function LikeButton({
    postId,
    initialLiked = false,
    initialCount = 0,
    initialReaction = 'like',
    size = 'md',
    showCount = true,
    showLabel = false
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [reaction, setReaction] = useState(initialReaction);
    const [showPicker, setShowPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        // Toggle like with optimistic UI
        const newLiked = !liked;
        const newCount = newLiked ? count + 1 : count - 1;

        setLiked(newLiked);
        setCount(newCount);

        if (!newLiked) {
            setReaction('like');
            setShowPicker(false);
        }

        setIsLoading(true);

        try {
            if (newLiked) {
                await api.post(`/likes/post/${postId}`, { reaction_type: reaction });
            } else {
                await api.delete(`/likes/post/${postId}`);
            }
        } catch (error) {
            // Revert on error
            setLiked(!newLiked);
            setCount(newLiked ? count : count + 1);
            console.error('Failed to update like:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReactionSelect = async (reactionType: string) => {
        if (isLoading) return;

        const wasLiked = liked;
        const prevReaction = reaction;

        // Optimistic update
        if (!liked) {
            setCount(count + 1);
        }
        setLiked(true);
        setReaction(reactionType);
        setShowPicker(false);

        setIsLoading(true);

        try {
            await api.post(`/likes/post/${postId}`, { reaction_type: reactionType });
        } catch (error) {
            // Revert on error
            setLiked(wasLiked);
            setReaction(prevReaction);
            if (!wasLiked) setCount(count);
            console.error('Failed to react:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentReaction = REACTIONS.find(r => r.type === reaction) || REACTIONS[0];

    const sizeClasses = {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-1.5',
        lg: 'text-lg px-4 py-2'
    };

    return (
        <div className="relative inline-flex">
            <button
                onClick={handleClick}
                onMouseEnter={() => liked && setShowPicker(true)}
                className={`
                    inline-flex items-center gap-1.5 rounded-full transition-all
                    ${liked
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                    ${sizeClasses[size]}
                `}
            >
                <motion.span
                    whileTap={{ scale: 0.8 }}
                    animate={liked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.2 }}
                >
                    {currentReaction.emoji}
                </motion.span>

                {showCount && (
                    <span className="font-medium">{count}</span>
                )}

                {showLabel && (
                    <span className="text-xs font-medium ml-1">
                        {liked ? 'Liked' : 'Like'}
                    </span>
                )}
            </button>

            {/* Reaction Picker */}
            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-slate-200 p-1.5 flex gap-1 z-50"
                        onMouseLeave={() => setShowPicker(false)}
                    >
                        {REACTIONS.map((r) => (
                            <button
                                key={r.type}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReactionSelect(r.type);
                                }}
                                className={`
                                    w-8 h-8 flex items-center justify-center text-lg rounded-full
                                    transition-all hover:scale-125 hover:bg-slate-100
                                    ${reaction === r.type ? 'bg-slate-100 scale-110' : ''}
                                `}
                                title={r.label}
                            >
                                {r.emoji}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface BookmarkButtonProps {
    postId: number;
    initialBookmarked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function BookmarkButton({
    postId,
    initialBookmarked = false,
    size = 'md',
    showLabel = false
}: BookmarkButtonProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update
        const newBookmarked = !bookmarked;
        setBookmarked(newBookmarked);

        setIsLoading(true);

        try {
            if (newBookmarked) {
                await api.post(`/bookmarks/${postId}`);
            } else {
                await api.delete(`/bookmarks/${postId}`);
            }
        } catch (error) {
            // Revert on error
            setBookmarked(!newBookmarked);
            console.error('Failed to update bookmark:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            disabled={isLoading}
            className={`
                inline-flex items-center justify-center rounded-full transition-all
                ${bookmarked
                    ? 'bg-teal-100 text-teal-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }
                ${sizeClasses[size]}
            `}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
            <svg
                className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </svg>

            {showLabel && (
                <span className="ml-2 text-sm font-medium">
                    {bookmarked ? 'Saved' : 'Save'}
                </span>
            )}
        </motion.button>
    );
}

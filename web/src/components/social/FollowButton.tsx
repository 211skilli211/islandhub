'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface FollowButtonProps {
    userId: number;
    initialFollowing?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
}

export default function FollowButton({
    userId,
    initialFollowing = false,
    size = 'md',
    showLabel = true,
    variant = 'primary'
}: FollowButtonProps) {
    const router = useRouter();
    const [following, setFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update
        const newFollowing = !following;
        setFollowing(newFollowing);

        setIsLoading(true);

        try {
            if (newFollowing) {
                await api.post(`/followers/${userId}`);
            } else {
                await api.delete(`/followers/${userId}`);
            }
        } catch (error) {
            // Revert on error
            setFollowing(!newFollowing);
            console.error('Failed to update follow status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-5 py-2 text-sm',
        lg: 'px-8 py-3 text-base'
    };

    const variantClasses = {
        primary: following
            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            : 'bg-teal-600 text-white hover:bg-teal-700',
        outline: following
            ? 'border-2 border-slate-300 text-slate-600 hover:border-slate-400'
            : 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
        ghost: following
            ? 'text-slate-600 hover:bg-slate-100'
            : 'text-teal-600 hover:bg-teal-50'
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            disabled={isLoading}
            className={`
                inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider rounded-full
                transition-all ${sizeClasses[size]} ${variantClasses[variant]}
                ${isLoading ? 'opacity-50 cursor-wait' : ''}
            `}
        >
            {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {following ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                </>
            )}

            {showLabel && (
                <span>
                    {following ? 'Following' : 'Follow'}
                </span>
            )}
        </motion.button>
    );
}

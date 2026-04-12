'use client';
// refresh

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface PostComposerProps {
    onPostCreated?: (post: any) => void;
    placeholder?: string;
    compact?: boolean;
}

export default function PostComposer({ onPostCreated, placeholder = "What's on your mind?", compact = false }: PostComposerProps) {
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const emojis = ['📸', '🎥', '📍', '📝', '🎉', '💡', '❤️', '🌟'];

    const handleSubmit = async () => {
        if (!content.trim() && media.length === 0) return;

        setIsPosting(true);
        try {
            const response = await api.post('/posts', {
                content: content.trim(),
                media,
                visibility
            });

            if (onPostCreated) {
                onPostCreated(response.data);
            }

            // Reset form
            setContent('');
            setMedia([]);
            setIsExpanded(false);
            setVisibility('public');
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // For now, we'll use placeholder URLs - in production, upload to storage
        const newMedia = Array.from(files).map((file, index) =>
            URL.createObjectURL(file)
        );
        setMedia(prev => [...prev, ...newMedia]);
    };

    const removeMedia = (index: number) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    };

    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = content.substring(0, start) + emoji + content.substring(end);
            setContent(newContent);
            // Reset cursor position after emoji
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setContent(prev => prev + emoji);
        }
        setShowEmojiPicker(false);
    };

    if (compact) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-linear-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        U
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                    </div>
                </div>

                {isExpanded && content.trim() && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                {emojis.slice(0, 4).map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => insertEmoji(emoji)}
                                        className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors text-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isPosting}
                                className="px-6 py-2 bg-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-teal-700 transition-colors"
                            >
                                {isPosting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                        U
                    </div>
                    <div className="flex-1">
                        <p className="font-black text-slate-900">Welcome to the Community!</p>
                        <p className="text-xs text-slate-400 font-medium">Share your island story</p>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex bg-slate-50 rounded-xl p-1">
                        {(['public', 'followers', 'private'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setVisibility(v)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${visibility === v
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {v === 'public' && '🌎'}
                                {v === 'followers' && '👥'}
                                {v === 'private' && '🔒'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows={isExpanded ? 4 : 2}
                    className="w-full text-lg font-medium text-slate-700 placeholder:text-slate-300 outline-none resize-none transition-all"
                />

                {/* Media Preview */}
                <AnimatePresence>
                    {media.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6"
                        >
                            <div className={`grid gap-2 ${media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {media.map((url, index) => (
                                    <div key={index} className="relative group rounded-2xl overflow-hidden">
                                        <img
                                            src={url}
                                            alt={`Media ${index + 1}`}
                                            className="w-full h-48 object-cover"
                                        />
                                        <button
                                            onClick={() => removeMedia(index)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions Footer */}
            <div className="px-8 pb-8">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleMediaUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-xl font-bold text-sm transition-colors"
                        >
                            📷 Photo/Video
                        </button>
                        <button
                            onClick={() => insertEmoji('📍')}
                            className="px-4 py-2 bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-xl font-bold text-sm transition-colors"
                        >
                            📍 Location
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="px-4 py-2 bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 rounded-xl font-bold text-sm transition-colors"
                            >
                                😊 Emoji
                            </button>

                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-10"
                                    >
                                        <div className="grid grid-cols-4 gap-2">
                                            {emojis.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => insertEmoji(emoji)}
                                                    className="w-10 h-10 hover:bg-slate-50 rounded-xl flex items-center justify-center text-xl transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isPosting || (!content.trim() && media.length === 0)}
                        className="px-8 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        {isPosting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Posting...
                            </span>
                        ) : (
                            '🚀 Share Post'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

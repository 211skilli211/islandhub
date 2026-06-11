'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '@/lib/toast';
import { Star, MessageSquare, Reply, User, Calendar, CheckCircle } from 'lucide-react';

interface Review {
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    product_name?: string;
    verified: boolean;
    reply_text?: string;
    replied_at?: string;
    created_at: string;
}

interface VendorReviewsProps {
    storeId?: number;
}

export default function VendorReviews({ storeId }: VendorReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const fetchReviews = async () => {
        if (!storeId) return;
        try {
            const res = await api.get(`/reviews/store/${storeId}`);
            setReviews(res.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [storeId]); // `fetchReviews` is stable as it's defined outside the effect and depends on `storeId` which is in the dependency array.

    const handleReply = async (reviewId: number) => {
        try {
            await api.post(`/reviews/${reviewId}/reply`, { reply_text: replyText });
            toast.success('Reply posted!');
            setReplyingTo(null);
            setReplyText('');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to post reply');
        }
    };

    if (loading) return <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-border-primary border-t-teal-600 mx-auto" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-ink-primary tracking-tight">Reputation Manager</h2>
                <p className="text-ink-tertiary font-medium">Hear what your customers are saying and respond to feedback</p>
            </div>

            {reviews.length === 0 ? (
                <div className="py-20 text-center bg-surface-secondary/50 rounded-[3rem] border-2 border-dashed border-border-primary">
                    <Star size={48} className="mx-auto text-ink-tertiary mb-4" />
                    <h3 className="text-xl font-black text-ink-primary">No Reviews Yet</h3>
                    <p className="text-ink-tertiary font-medium max-w-xs mx-auto">Great service leads to great reviews. Keep up the good work!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface-elevated rounded-[2.5rem] p-8 border border-border-primary shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-surface-secondary rounded-full flex items-center justify-center text-ink-tertiary">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-ink-primary">{review.reviewer_name}</h4>
                                            {review.verified && (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">
                                                    <CheckCircle size={10} /> Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString()}
                                            {review.product_name && <span>• For: {review.product_name}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={18}
                                            className={s <= review.rating ? 'fill-amber-400 text-sand-400' : 'text-ink-tertiary'}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-ink-secondary font-medium text-lg leading-relaxed italic mb-8">
                                "{review.comment}"
                            </p>

                            {review.reply_text ? (
                                <div className="bg-surface-secondary rounded-3xl p-6 border border-border-primary relative">
                                    <div className="absolute -top-3 left-8 px-3 py-1 bg-surface-elevated border border-border-primary rounded-full text-[8px] font-black uppercase tracking-widest text-ink-tertiary">
                                        Your Response
                                    </div>
                                    <p className="text-ink-tertiary font-bold text-sm leading-relaxed">
                                        {review.reply_text}
                                    </p>
                                    <p className="text-[8px] font-black text-ink-tertiary uppercase tracking-widest mt-4">
                                        Replied on {new Date(review.replied_at!).toLocaleDateString()}
                                    </p>
                                </div>
                            ) : replyingTo === review.id ? (
                                <div className="space-y-4">
                                    <textarea
                                        autoFocus
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your response here..."
                                        className="w-full p-6 bg-surface-secondary rounded-3xl border-2 border-border-primary focus:border-teal-500 outline-none transition-all font-medium text-sm min-h-[120px]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReply(review.id)}
                                            className="px-6 py-3 bg-ink-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Post Response
                                        </button>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="px-6 py-3 bg-surface-elevated text-ink-tertiary border border-border-primary rounded-xl font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(review.id)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-400 hover:text-accent-500 transition-colors"
                                >
                                    <Reply size={14} /> Respond to this review
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

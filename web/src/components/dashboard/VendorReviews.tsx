'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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

    if (loading) return <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-teal-600 mx-auto" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reputation Manager</h2>
                <p className="text-slate-500 font-medium">Hear what your customers are saying and respond to feedback</p>
            </div>

            {reviews.length === 0 ? (
                <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Star size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-black text-slate-800">No Reviews Yet</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Great service leads to great reviews. Keep up the good work!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-slate-900">{review.reviewer_name}</h4>
                                            {review.verified && (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle size={10} /> Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
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
                                            className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-slate-600 font-medium text-lg leading-relaxed italic mb-8">
                                "{review.comment}"
                            </p>

                            {review.reply_text ? (
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative">
                                    <div className="absolute -top-3 left-8 px-3 py-1 bg-white border border-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400">
                                        Your Response
                                    </div>
                                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                                        {review.reply_text}
                                    </p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-4">
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
                                        className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all font-medium text-sm min-h-[120px]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReply(review.id)}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Post Response
                                        </button>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="px-6 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(review.id)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors"
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

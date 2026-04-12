'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewSectionProps {
    vendorId: string;
    listingId?: string;
}

export default function ReviewSection({ vendorId, listingId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/reviews/vendor/${vendorId}`);
            setReviews(res.data);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [vendorId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                vendor_id: vendorId,
                listing_id: listingId,
                rating,
                comment
            });
            setComment('');
            fetchReviews();
        } catch (error) {
            console.error('Failed to submit review', error);
            alert('Failed to submit review. Ensure you have an order with this vendor.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Customer Reviews</h3>
                    <p className="text-slate-500 font-medium">Hear from the island community.</p>
                </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Leave a Review</h4>
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition-all ${rating >= star ? 'scale-110 grayscale-0' : 'grayscale opacity-30 shadow-none'}`}
                        >
                            ⭐
                        </button>
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-6 py-4 bg-white border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all h-24 mb-6"
                    required
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                    {submitting ? 'Posting...' : 'Post Review'}
                </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-32 bg-slate-50 rounded-3xl" />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-slate-400 font-bold italic text-center py-12">No reviews yet. Be the first to share!</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={review.review_id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex gap-6"
                            >
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-xl shadow-inner font-black text-indigo-500 shrink-0">
                                    {review.reviewer_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h5 className="font-black text-slate-900">{review.reviewer_name}</h5>
                                            {review.verified && (
                                                <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit mt-0.5">
                                                    <span>✅</span> Verified Purchase
                                                </div>
                                            )}
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 text-sm">
                                            {Array.from({ length: review.rating }).map((_, i) => (
                                                <span key={i}>⭐</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed">{review.comment}</p>

                                    {review.reply_text && (
                                        <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative ml-4">
                                            <div className="absolute -top-2 left-4 bg-white border border-slate-200 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                Response from Vendor
                                            </div>
                                            <p className="text-slate-600/90 text-sm font-medium italic">"{review.reply_text}"</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{new Date(review.replied_at).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

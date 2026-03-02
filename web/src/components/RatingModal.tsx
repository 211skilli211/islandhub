'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingModalProps {
    deliveryId: number;
    driverName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RatingModal({ deliveryId, driverName, onClose, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/ratings/delivery/${deliveryId}`, {
                rating,
                review
            });
            toast.success('Thank you for your feedback! 🌟');
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                        ⭐
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Rate Your Driver</h2>
                    <p className="text-slate-500 font-medium mb-8">How was your experience with <span className="text-slate-900 font-bold">{driverName}</span>?</p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="text-4xl transition-transform hover:scale-125 focus:outline-none"
                                >
                                    <span className={star <= (hover || rating) ? 'text-amber-400' : 'text-slate-200'}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Review Text */}
                        <div className="text-left">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                                Write a Review (Optional)
                            </label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Tell us what you liked or how we can improve..."
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all min-h-[120px]"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Not Now
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-teal-500/20"
                            >
                                {submitting ? 'Sending...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

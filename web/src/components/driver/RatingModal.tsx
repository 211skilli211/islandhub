'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from '@/lib/toast';

interface RatingModalProps {
  isOpen: boolean;
  tripId: string;
  driverName: string;
  driverVehicle?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
const RATING_EMOJIS = ['', '😞', '😐', '😊', '😄', '🌟'];

export default function RatingModal({
  isOpen,
  tripId,
  driverName,
  driverVehicle,
  onClose,
  onSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeRating = hoveredRating || rating;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/dispatch/trip/rate', {
        trip_id: tripId,
        rating,
        comment: comment.trim() || undefined,
      });

      setSubmitted(true);
      toast.success('Thanks for your feedback!');

      setTimeout(() => {
        onSubmitted();
      }, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-surface-elevated rounded-3xl border border-border-primary shadow-2xl overflow-hidden"
          >
            {submitted ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-xl font-black text-ink-primary mb-2">Thank You!</h2>
                <p className="text-sm text-ink-tertiary">Your feedback helps improve the experience for everyone.</p>
              </div>
            ) : (
              <>
                
                <div className="p-6 pb-4 text-center border-b border-border-primary">
                  <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                    ⭐
                  </div>
                  <h2 className="text-xl font-black text-ink-primary mb-1">Rate Your Trip</h2>
                  <p className="text-sm text-ink-tertiary">
                    How was your ride with <span className="font-bold text-ink-primary">{driverName}</span>?
                    {driverVehicle && <span className="text-ink-tertiary"> ({driverVehicle})</span>}
                  </p>
                </div>

                
                <div className="p-6">
                  <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-all duration-150 hover:scale-110 active:scale-95"
                      >
                        <span className={`text-4xl ${
                          star <= activeRating ? 'drop-shadow-lg' : 'grayscale opacity-40'
                        }`}>
                          {RATING_EMOJIS[star]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {activeRating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm font-bold text-accent-400 mb-4"
                    >
                      {RATING_LABELS[activeRating]}
                    </motion.p>
                  )}

                  
                  {rating >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4"
                    >
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us what went well (optional)..."
                        className="w-full px-4 py-3 bg-surface-secondary border border-border-primary rounded-xl text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all resize-none"
                        rows={3}
                        maxLength={200}
                      />
                      <p className="text-[10px] text-ink-tertiary text-right mt-1">{comment.length}/200</p>
                    </motion.div>
                  )}

                  {rating > 0 && rating < 4 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4"
                    >
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us how we can improve..."
                        className="w-full px-4 py-3 bg-surface-secondary border border-border-primary rounded-xl text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all resize-none"
                        rows={2}
                        maxLength={200}
                      />
                    </motion.div>
                  )}
                </div>

                
                <div className="p-6 pt-0 flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 bg-surface-secondary text-ink-secondary rounded-xl font-bold text-sm border border-border-primary hover:bg-surface-tertiary transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="flex-[2] py-3 bg-accent-500 text-white rounded-xl font-bold text-sm hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      'Submit Rating'
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface IncomingRequest {
  id: string;
  title: string;
  service_type: string;
  pickup_location: any;
  dropoff_location: any;
  price: number;
  distance?: number;
  passenger_count?: number;
  notes?: string;
  created_at: string;
}

interface IncomingRideModalProps {
  isOpen: boolean;
  request: IncomingRequest | null;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  autoCloseSeconds?: number;
}

export default function IncomingRideModal({
  isOpen,
  request,
  onAccept,
  onDecline,
  autoCloseSeconds = 30,
}: IncomingRideModalProps) {
  const [countdown, setCountdown] = useState(autoCloseSeconds);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoCloseSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(request?.id || '');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoCloseSeconds, onDecline, request?.id]);

  const handleAccept = async () => {
    if (!request) return;
    setAccepting(true);
    try {
      await api.post('/drivers/dispatch/accept', { request_id: request.id });
      toast.success('Trip accepted! 🚀');
      onAccept(request.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to accept');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    if (!request) return;
    onDecline(request.id);
  };

  const formatLocation = (loc: any): string => {
    if (!loc) return 'Unknown';
    if (typeof loc === 'string') return loc.split(',')[0];
    return loc.address?.split(',')[0] || loc.name || 'Unknown';
  };

  const progress = (countdown / autoCloseSeconds) * 100;
  const isUrgent = countdown <= 10;

  return (
    <AnimatePresence>
      {isOpen && request && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        >
          
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDecline} />

          
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-surface-elevated rounded-3xl border border-border-primary shadow-2xl overflow-hidden"
          >
            
            <div className="h-1.5 bg-surface-secondary">
              <motion.div
                className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-accent-500'}`}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>

            
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent-500/10 rounded-2xl flex items-center justify-center text-2xl animate-bounce">
                    {request.service_type === 'taxi' ? '🚖' : request.service_type === 'delivery' ? '📦' : '<EmojiIcon emoji="🚚" size={16} />'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-ink-primary">Incoming Request!</h2>
                    <p className="text-xs text-ink-tertiary font-bold">{request.service_type.toUpperCase()}</p>
                  </div>
                </div>
                <div className={`text-3xl font-black ${isUrgent ? 'text-red-400 animate-pulse' : 'text-accent-400'}`}>
                  {countdown}
                </div>
              </div>

              
              <div className="bg-accent-500/10 rounded-2xl p-4 mb-4 text-center">
                <p className="text-[10px] text-accent-400 font-black uppercase tracking-widest mb-1">Estimated Fare</p>
                <p className="text-4xl font-black text-accent-400">${request.price}</p>
                {request.distance && (
                  <p className="text-xs text-ink-tertiary mt-1">{request.distance.toFixed(1)} km</p>
                )}
              </div>

              
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-ink-tertiary font-bold uppercase">Pickup</p>
                    <p className="text-sm font-bold text-ink-primary">{formatLocation(request.pickup_location)}</p>
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-surface-tertiary ml-1.5" />
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-ink-tertiary font-bold uppercase">Dropoff</p>
                    <p className="text-sm font-bold text-ink-primary">{formatLocation(request.dropoff_location)}</p>
                  </div>
                </div>
              </div>

              
              {(request.passenger_count || request.notes) && (
                <div className="flex gap-2 flex-wrap">
                  {request.passenger_count && (
                    <span className="px-3 py-1 bg-surface-secondary rounded-lg text-xs font-bold text-ink-secondary">
                      👤 {request.passenger_count} passenger{request.passenger_count > 1 ? 's' : ''}
                    </span>
                  )}
                  {request.notes && (
                    <span className="px-3 py-1 bg-surface-secondary rounded-lg text-xs font-bold text-ink-secondary truncate max-w-[200px]">
                      📝 {request.notes}
                    </span>
                  )}
                </div>
              )}
            </div>

            
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={handleDecline}
                disabled={accepting}
                className="flex-1 py-4 bg-surface-secondary text-ink-secondary rounded-xl font-black text-sm border border-border-primary hover:bg-surface-tertiary transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-[2] py-4 bg-accent-500 text-white rounded-xl font-black text-sm hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20 disabled:opacity-50"
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Accepting...
                  </span>
                ) : (
                  'Accept Trip 🚀'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

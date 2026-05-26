'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast from '@/lib/toast';

interface TripData {
  id: string;
  title: string;
  status: string;
  pickup_location: any;
  dropoff_location: any;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle?: string;
  driver_lat?: number;
  driver_lng?: number;
  estimated_arrival?: string;
  fare_amount: number;
  rider_name?: string;
  created_at: string;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Finding Driver', icon: '🔍' },
  { key: 'accepted', label: 'Driver Assigned', icon: '✅' },
  { key: 'arrived', label: 'Driver Arrived', icon: '📍' },
  { key: 'picked_up', label: 'Picked Up', icon: '🚗' },
  { key: 'in_transit', label: 'On the Way', icon: '🛣️' },
  { key: 'completed', label: 'Completed', icon: '🏁' },
];

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function TrackRidePage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrip = useCallback(async () => {
    try {
      const res = await api.get(`/dispatch/trip/current`);
      if (res.data?.trip) {
        setTrip(res.data.trip);
        setError('');
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Trip not found');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchTrip, 10000);
    return () => clearInterval(interval);
  }, [fetchTrip]);

  const cancelTrip = async () => {
    if (!confirm('Cancel this trip?')) return;
    try {
      await api.post(`/logistics/jobs/${tripId}/cancel`);
      toast.success('Trip cancelled');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-500/20 border-t-accent-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-tertiary font-bold">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-black text-ink-primary mb-2">{error || 'Trip not found'}</h1>
          <p className="text-ink-tertiary mb-6">The trip you're looking for doesn't exist or has ended.</p>
          <Link href="/request-ride" className="px-8 py-3 bg-accent-500 text-white rounded-xl font-bold">
            Request a Ride
          </Link>
        </div>
      </div>
    );
  }

  const stepIndex = getStepIndex(trip.status);
  const isCompleted = trip.status === 'completed';
  const isCancelled = trip.status === 'cancelled';

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-primary sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-ink-primary">Track Your Ride</h1>
            <p className="text-xs text-ink-tertiary">Trip #{trip.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : isCancelled ? 'bg-red-500' : 'bg-accent-500 animate-pulse'}`} />
            <span className="text-xs font-bold text-ink-secondary">
              {isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Status Progress */}
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
          <div className="flex items-center justify-between mb-4">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 transition-all ${
                  idx <= stepIndex
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface-tertiary text-ink-tertiary'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight ${
                  idx <= stepIndex ? 'text-accent-400' : 'text-ink-tertiary'
                }`}>
                  {step.label}
                </span>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-[calc(100%-2rem)] left-[calc(50%+1rem)] top-4 ${
                    idx < stepIndex ? 'bg-accent-500' : 'bg-surface-tertiary'
                  }`} style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((stepIndex + 1) / STATUS_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Driver Info */}
        {trip.driver_name && !isCompleted && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-elevated rounded-2xl border border-border-primary p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center text-2xl">
                👨‍✈️
              </div>
              <div className="flex-1">
                <h3 className="font-black text-ink-primary">{trip.driver_name}</h3>
                <p className="text-sm text-ink-tertiary">{trip.driver_vehicle || 'Vehicle info'}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-accent-400">${trip.fare_amount}</p>
                <p className="text-[10px] text-ink-tertiary uppercase font-bold">Est. Fare</p>
              </div>
            </div>

            <div className="flex gap-3">
              {trip.driver_phone && (
                <a
                  href={`tel:${trip.driver_phone}`}
                  className="flex-1 py-3 bg-accent-500 text-white rounded-xl font-bold text-sm text-center"
                >
                  📞 Call Driver
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${
                  trip.driver_lat && trip.driver_lng
                    ? `${trip.driver_lat},${trip.driver_lng}`
                    : encodeURIComponent(typeof trip.pickup_location === 'string' ? trip.pickup_location : trip.pickup_location?.address || '')
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-surface-secondary text-ink-primary rounded-xl font-bold text-sm text-center border border-border-primary"
              >
                🗺️ Open Maps
              </a>
            </div>
          </motion.div>
        )}

        {/* Trip Details */}
        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
          <h3 className="text-sm font-black text-ink-tertiary uppercase tracking-widest mb-4">Trip Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-ink-tertiary font-bold uppercase">Pickup</p>
                <p className="text-sm font-bold text-ink-primary">
                  {typeof trip.pickup_location === 'string'
                    ? trip.pickup_location
                    : trip.pickup_location?.address || 'Pickup location'}
                </p>
              </div>
            </div>
            <div className="w-0.5 h-4 bg-surface-tertiary ml-1.5" />
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-ink-tertiary font-bold uppercase">Dropoff</p>
                <p className="text-sm font-bold text-ink-primary">
                  {typeof trip.dropoff_location === 'string'
                    ? trip.dropoff_location
                    : trip.dropoff_location?.address || 'Dropoff location'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isCompleted && !isCancelled && (
          <div className="space-y-3">
            <button
              onClick={cancelTrip}
              className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              Cancel Trip
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-black text-emerald-400 mb-1">Trip Completed!</h3>
            <p className="text-sm text-ink-tertiary mb-4">Thanks for riding with IslandHub</p>
            <div className="flex gap-3">
              <Link
                href="/request-ride"
                className="flex-1 py-3 bg-accent-500 text-white rounded-xl font-bold text-sm text-center"
              >
                Book Another Ride
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-surface-elevated text-ink-primary rounded-xl font-bold text-sm text-center border border-border-primary"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Refresh indicator */}
        <div className="text-center">
          <p className="text-[10px] text-ink-tertiary">Auto-refreshing every 10 seconds</p>
        </div>
      </div>
    </div>
  );
}

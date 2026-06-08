'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import api from '@/lib/api';

const LiveTrackingMap = dynamic(() => import('@/components/transport/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-ink-900/50 rounded-2xl animate-pulse flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-2">🗺️</div><p className="text-ink-500 text-sm">Loading map...</p></div>
    </div>
  ),
});

interface TripData {
  trip_id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  driver_name?: string;
  driver_vehicle?: string;
  driver_lat?: number;
  driver_lng?: number;
  fare_amount?: number;
  distance_km?: number;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Finding Driver', icon: '🔍' },
  { key: 'assigned', label: 'Driver Assigned', icon: '✅' },
  { key: 'arrived', label: 'Driver Arrived', icon: '📍' },
  { key: 'picked_up', label: 'Picked Up', icon: '🚗' },
  { key: 'in_transit', label: 'On the Way', icon: '🛣️' },
  { key: 'completed', label: 'Completed', icon: '🏁' },
];

export default function TrackRidePage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [driverTrail, setDriverTrail] = useState<{ lat: number; lng: number }[]>([]);

  const fetchTrip = useCallback(async () => {
    try {
      const res = await api.get(`/rides/tracking/${tripId}`);
      const data = res.data.trip;
      setTrip(data);
      setError('');

      if (data.driver_lat && data.driver_lng) {
        setDriverTrail(prev => [...prev.slice(-99), { lat: data.driver_lat!, lng: data.driver_lng! }]);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) setError('Trip not found');
      else setError('Failed to load trip');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
    const iv = setInterval(fetchTrip, 8000);
    return () => clearInterval(iv);
  }, [fetchTrip]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-400">Loading trip...</p>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">{error || 'Trip not found'}</h1>
          <p className="text-ink-400 mb-6">This trip doesn't exist or has ended.</p>
          <Link href="/request-ride" className="px-8 py-3 bg-teal-500 text-white rounded-xl font-bold inline-block">
            Request a Ride
          </Link>
        </div>
      </main>
    );
  }

  const stepIndex = STATUS_STEPS.findIndex(s => s.key === trip.status);
  const isActive = !['completed', 'cancelled'].includes(trip.status);

  const pickup = trip.pickup_lat && trip.pickup_lng ? { lat: trip.pickup_lat, lng: trip.pickup_lng, address: trip.pickup_address } : null;
  const dropoff = trip.dropoff_lat && trip.dropoff_lng ? { lat: trip.dropoff_lat, lng: trip.dropoff_lng, address: trip.dropoff_address } : null;
  const driver = trip.driver_lat && trip.driver_lng ? { id: 'driver', name: trip.driver_name || 'Driver', lat: trip.driver_lat, lng: trip.driver_lng, vehicle: trip.driver_vehicle } : null;

  return (
    <main className="min-h-screen bg-black">
      {/* Live Map */}
      <div className="h-[50vh] relative">
        <LiveTrackingMap
          pickup={pickup}
          dropoff={dropoff}
          driver={driver}
          liveTrail={driverTrail}
          height="100%"
          zoom={14}
        />
        {/* Status badge */}
        {isActive && (
          <div className="absolute top-4 right-4 z-[1000] bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg text-sm">
            {STATUS_STEPS[stepIndex]?.icon} {STATUS_STEPS[stepIndex]?.label}
          </div>
        )}
        {/* Home button */}
        <Link href="/" className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-ink-400 hover:text-white transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
          Home
        </Link>
      </div>

      {/* Trip Details */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10 pb-8">
        <div className="bg-ink-900/90 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-1 mb-5">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${idx <= stepIndex ? 'bg-teal-400' : 'bg-white/10'}`} />
                {idx < STATUS_STEPS.length - 1 && <div className={`w-5 h-0.5 ${idx < stepIndex ? 'bg-teal-400' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          {/* Driver info */}
          {trip.driver_name && isActive && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl">🚕</div>
                <div className="flex-1">
                  <span className="font-bold text-white text-sm">{trip.driver_name}</span>
                  {trip.driver_vehicle && <p className="text-xs text-ink-400">{trip.driver_vehicle}</p>}
                </div>
                {trip.distance_km && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-teal-400">{trip.distance_km} km</p>
                    <p className="text-[10px] text-ink-500">Distance</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Route */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="w-0.5 h-8 bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{trip.pickup_address}</p>
                <p className="text-sm text-white font-medium mt-3">{trip.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Fare */}
          {trip.fare_amount != null && (
            <div className="flex items-center justify-between p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl mb-4">
              <span className="text-sm text-ink-400">Estimated fare</span>
              <span className="text-lg font-bold text-teal-400">${trip.fare_amount.toFixed(2)} XCD</span>
            </div>
          )}

          {/* Completed state */}
          {trip.status === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-green-400 mb-1">Trip Completed!</h3>
              <p className="text-sm text-ink-400 mb-4">Thanks for riding with IslandHub</p>
              <Link href="/request-ride" className="inline-block px-6 py-2.5 bg-teal-500 text-white rounded-xl font-bold text-sm">
                Book Another Ride
              </Link>
            </div>
          )}

          <p className="text-[10px] text-ink-600 text-center mt-3">Auto-refreshing every 8 seconds · Share this link to let others track this ride</p>
        </div>
      </div>
    </main>
  );
}

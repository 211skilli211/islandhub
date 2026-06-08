'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ActiveRide {
  ride_id: string;
  status: 'searching' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  driver_name?: string;
  driver_phone?: string;
  driver_rating?: number;
  vehicle_model?: string;
  vehicle_plate?: string;
  vehicle_color?: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare: number;
  estimated_arrival?: string;
}

const STATUS_MESSAGES: Record<ActiveRide['status'], { title: string; subtitle: string; icon: string }> = {
  searching: { title: 'Finding a driver...', subtitle: 'This usually takes less than a minute', icon: '🔍' },
  accepted: { title: 'Driver found!', subtitle: 'Your driver is on the way', icon: '✅' },
  en_route: { title: 'Driver is arriving', subtitle: 'Your driver is on the way to pickup', icon: '🚗' },
  arrived: { title: 'Driver has arrived', subtitle: 'Your driver is waiting at the pickup point', icon: '📍' },
  in_progress: { title: 'On your way', subtitle: 'Sit back and enjoy the ride', icon: '🛣️' },
  completed: { title: 'Ride completed', subtitle: 'Thank you for riding with IslandHub', icon: '✓' },
  cancelled: { title: 'Ride cancelled', subtitle: 'Your ride has been cancelled', icon: '✕' },
};

const STATUS_STEPS: ActiveRide['status'][] = ['searching', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'];

export default function ActiveRidePage() {
  const [ride, setRide] = useState<ActiveRide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from API
    // For now, show a demo state
    const demoRide: ActiveRide = {
      ride_id: 'IR-2026-001',
      status: 'en_route',
      driver_name: 'Marcus Thompson',
      driver_phone: '+1 (869) 555-0123',
      driver_rating: 4.9,
      vehicle_model: 'Toyota Corolla 2022',
      vehicle_plate: 'SKN-2022-847',
      vehicle_color: 'White',
      pickup_address: 'Frigate Bay Beach, St. Kitts',
      dropoff_address: 'Robert L. Bradshaw Airport, St. Kitts',
      estimated_fare: 24.00,
      estimated_arrival: '3 min',
    };
    setRide(demoRide);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-400">Loading ride status...</p>
        </div>
      </main>
    );
  }

  if (!ride) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-white mb-2">No active rides</h1>
          <p className="text-ink-400 mb-6">You don't have any active rides at the moment.</p>
          <Link href="/request-ride" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-xl transition-all">
            Request a Ride
          </Link>
        </div>
      </main>
    );
  }

  const statusInfo = STATUS_MESSAGES[ride.status];
  const currentStepIndex = STATUS_STEPS.indexOf(ride.status);

  return (
    <main className="min-h-screen bg-black">
      {/* ── Map placeholder ── */}
      <div className="h-[45vh] bg-ink-900 relative overflow-hidden">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">🗺️</div>
            <p className="text-ink-500 text-sm">Live tracking map</p>
          </div>
        </div>

        {/* Back button */}
        <Link href="/transport" className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg text-ink-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        {/* ETA badge */}
        {ride.estimated_arrival && (
          <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl shadow-lg">
            ETA {ride.estimated_arrival}
          </div>
        )}
      </div>

      {/* ── Ride Status ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-ink-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
          {/* Status header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{statusInfo.icon}</div>
            <h1 className="text-xl font-bold text-white">{statusInfo.title}</h1>
            <p className="text-ink-400 text-sm mt-1">{statusInfo.subtitle}</p>
            <p className="text-ink-600 text-xs mt-2">Ride #{ride.ride_id}</p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-3 h-3 rounded-full transition-all ${
                  i <= currentStepIndex ? 'bg-yellow-400' : 'bg-white/10'
                }`} />
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-yellow-400' : 'bg-white/5'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Driver info */}
          {ride.driver_name && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-2xl">
                  🚕
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ride.driver_name}</span>
                    {ride.driver_rating && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        ★ {ride.driver_rating}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-ink-400 mt-0.5">{ride.vehicle_model}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{ride.vehicle_color} · {ride.vehicle_plate}</div>
                </div>
                {ride.driver_phone && (
                  <a href={`tel:${ride.driver_phone}`} className="w-10 h-10 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400 hover:bg-green-400/20 transition-colors">
                    📞
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Route */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="w-0.5 h-10 bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{ride.pickup_address}</div>
                <div className="text-sm text-white font-medium mt-4">{ride.dropoff_address}</div>
              </div>
            </div>
          </div>

          {/* Fare */}
          <div className="flex items-center justify-between p-3 bg-yellow-400/5 border border-yellow-400/10 rounded-xl mb-4">
            <span className="text-sm text-ink-400">Estimated fare</span>
            <span className="text-lg font-bold text-yellow-400">${ride.estimated_fare.toFixed(2)} XCD</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
              <button className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all text-sm">
                Cancel Ride
              </button>
            )}
            <Link href="/" className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all text-sm text-center">
              Back to Home
            </Link>
          </div>

          <p className="text-xs text-ink-600 text-center mt-4">
            🔒 Free cancellation up to 5 minutes after booking
          </p>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const LiveTrackingMap = dynamic(() => import('@/components/transport/LiveTrackingMap'), { ssr: false, loading: () => <MapSkeleton /> });

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-ink-900/50 rounded-2xl animate-pulse flex items-center justify-center">
      <div className="text-center"><EmojiIcon emoji="🗺️" size={48} className="text-5xl mb-2" /><p className="text-ink-500 text-sm">Loading map...</p></div>
    </div>
  );
}

interface ActiveRide {
  trip_id: string;
  status: 'searching' | 'assigned' | 'arrived' | 'picked_up' | 'in_transit' | 'completed' | 'cancelled';
  driver_name?: string;
  driver_phone?: string;
  driver_rating?: number;
  driver_vehicle?: string;
  driver_plate?: string;
  driver_lat?: number;
  driver_lng?: number;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  fare_amount: number;
  eta_minutes?: number;
  service_type?: string;
}

const STATUS_CONFIG: Record<string, { title: string; subtitle: string; icon: string; color: string }> = {
  searching: { title: 'Finding a driver...', subtitle: 'This usually takes less than a minute', icon: '🔍', color: 'text-yellow-400' },
  assigned: { title: 'Driver assigned!', subtitle: 'Your driver is on the way', icon: '✅', color: 'text-teal-400' },
  arrived: { title: 'Driver has arrived', subtitle: 'Your driver is waiting at pickup', icon: '📍', color: 'text-green-400' },
  picked_up: { title: 'Picked up!', subtitle: 'You are on your way', icon: '🚗', color: 'text-teal-400' },
  in_transit: { title: 'On your way', subtitle: 'Sit back and enjoy the ride', icon: '🛣️', color: 'text-teal-400' },
  completed: { title: 'Ride completed', subtitle: 'Thank you for riding with IslandHub', icon: '✓', color: 'text-green-400' },
  cancelled: { title: 'Ride cancelled', subtitle: 'Your ride has been cancelled', icon: '✕', color: 'text-red-400' },
};

const STEPS = ['searching', 'assigned', 'arrived', 'picked_up', 'in_transit', 'completed'];

export default function ActiveRidePage() {
  const [ride, setRide] = useState<ActiveRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverTrail, setDriverTrail] = useState<{ lat: number; lng: number }[]>([]);

  const fetchRide = async () => {
    try {
      const res = await api.get('/rides/active');
      if (res.data?.ride) {
        const r: ActiveRide = res.data.ride;
        setRide(r);
        // Build trail from driver location history if available
        if (r.driver_lat && r.driver_lng) {
          setDriverTrail(prev => {
            const next = [...prev, { lat: r.driver_lat!, lng: r.driver_lng! }];
            return next.slice(-50); // Keep last 50 points
          });
        }
      } else {
        setRide(null);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRide();
    const iv = setInterval(fetchRide, 8000);
    return () => clearInterval(iv);
  }, []);

  const handleCancel = async () => {
    if (!ride) return;
    if (!confirm('Cancel this ride?')) return;
    try {
      await api.post(`/rides/${ride.trip_id}/cancel`);
      toast.success('Ride cancelled');
      fetchRide();
    } catch { toast.error('Failed to cancel ride'); }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-400">Loading ride status...</p>
        </div>
      </main>
    );
  }

  if (!ride) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <EmojiIcon emoji="🚗" size={48} className="text-6xl mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">No active rides</h1>
          <p className="text-ink-400 mb-6">You don't have any active rides at the moment.</p>
          <Link href="/request-ride" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl transition-all">
            Request a Ride
          </Link>
        </div>
      </main>
    );
  }

  const statusInfo = STATUS_CONFIG[ride.status] || STATUS_CONFIG.searching;
  const stepIndex = STEPS.indexOf(ride.status);
  const isActive = !['completed', 'cancelled'].includes(ride.status);

  const pickup = ride.pickup_lat && ride.pickup_lng ? { lat: ride.pickup_lat, lng: ride.pickup_lng, address: ride.pickup_address } : null;
  const dropoff = ride.dropoff_lat && ride.dropoff_lng ? { lat: ride.dropoff_lat, lng: ride.dropoff_lng, address: ride.dropoff_address } : null;
  const driver = ride.driver_lat && ride.driver_lng ? { id: 'driver', name: ride.driver_name || 'Driver', lat: ride.driver_lat, lng: ride.driver_lng, vehicle: ride.driver_vehicle } : null;

  return (
    <main className="min-h-screen bg-black">
      
      <div className="h-[55vh] relative">
        <LiveTrackingMap
          pickup={pickup}
          dropoff={dropoff}
          driver={driver}
          liveTrail={driverTrail}
          height="100%"
          zoom={14}
        />
        
        {ride.eta_minutes && isActive && (
          <div className="absolute top-4 right-4 z-[1000] bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg">
            ETA {ride.eta_minutes} min
          </div>
        )}
        
        <Link href="/transport" className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-ink-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
      </div>

      
      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10 pb-8">
        <div className="bg-ink-900/90 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl">
          
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">{statusInfo.icon}</div>
            <h1 className="text-lg font-bold text-white">{statusInfo.title}</h1>
            <p className="text-ink-400 text-sm">{statusInfo.subtitle}</p>
            <p className="text-ink-600 text-xs mt-1">Trip #{ride.trip_id}</p>
          </div>

          
          <div className="flex items-center justify-center gap-1 mb-5">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${i <= stepIndex ? 'bg-teal-400' : 'bg-white/10'}`} />
                {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < stepIndex ? 'bg-teal-400' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          
          {ride.driver_name && isActive && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <EmojiIcon emoji="🚕" size={20} className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{ride.driver_name}</span>
                    {ride.driver_rating && <EmojiIcon emoji="★" size={16} className="text-xs text-yellow-400" />}
                  </div>
                  <div className="text-xs text-ink-400">{ride.driver_vehicle} . {ride.driver_plate}</div>
                </div>
                {ride.driver_phone && (
                  <a href={`tel:${ride.driver_phone}`} className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors text-lg"><EmojiIcon emoji="📞" size={18} /></a>
                )}
              </div>
            </motion.div>
          )}

          
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="w-0.5 h-8 bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{ride.pickup_address}</div>
                <div className="text-sm text-white font-medium mt-3">{ride.dropoff_address}</div>
              </div>
            </div>
          </div>

          
          <div className="flex items-center justify-between p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl mb-4">
            <span className="text-sm text-ink-400">Estimated fare</span>
            <span className="text-lg font-bold text-teal-400">${ride.fare_amount.toFixed(2)} XCD</span>
          </div>

          
          <div className="flex gap-3">
            {isActive && (
              <button onClick={handleCancel} className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all text-sm">
                Cancel Ride
              </button>
            )}
            <Link href="/" className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all text-sm text-center">
              Back to Home
            </Link>
          </div>

          <EmojiIcon emoji="🔒" size={16} className="text-xs text-ink-600 text-center mt-3" />
        </div>
      </div>
    </main>
  );
}

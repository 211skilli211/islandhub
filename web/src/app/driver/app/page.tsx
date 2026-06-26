'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import Link from 'next/link';
import IncomingRideModal from '@/components/driver/IncomingRideModal';
import DriverEarnings from '@/components/driver/DriverEarnings';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const LiveTrackingMap = dynamic(() => import('@/components/transport/LiveTrackingMap'), { ssr: false });

interface DriverStatus {
  is_online: boolean;
  is_available: boolean;
  latitude?: number;
  longitude?: number;
  vehicle_type?: string;
  vehicle_plate?: string;
}

interface ActiveTrip {
  trip_id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  fare_amount: number;
  rider_name?: string;
  rider_phone?: string;
}

interface IncomingOffer {
  request_id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: string;
  expires_in: number;
}

export default function DriverApp() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DriverStatus>({ is_online: false, is_available: false });
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<IncomingOffer | null>(null);
  const [locationSharing, setLocationSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'earnings'>('home');
  const watchRef = useRef<number | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Auth guard
  useEffect(() => {
    if (isAuthenticated === false) { router.push('/login'); return; }
    if (user && !user.role?.startsWith('driver_') && user.role !== 'driver') {
      toast.error('Driver access required');
      router.push('/');
      return;
    }
    loadDriverData();
  }, [isAuthenticated, user, router]);

  // Load driver data
  const loadDriverData = async () => {
    try {
      const [statusRes, tripRes] = await Promise.all([
        api.get('/dispatch/status'),
        api.get('/dispatch/trip/current'),
      ]);
      setStatus(statusRes.data);
      setActiveTrip(tripRes.data.trip);
    } catch (error) {
      console.error('Failed to load driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for incoming offers & trip updates
  useEffect(() => {
    if (!status.is_online || activeTrip) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get('/dispatch/my-requests');
        const pending = res.data?.requests?.find((r: any) => r.status === 'pending');
        if (pending) {
          setIncomingOffer({
            request_id: pending.request_id,
            pickup: pending.pickup_address,
            dropoff: pending.dropoff_address,
            fare: pending.estimated_fare,
            distance: pending.distance_km,
            expires_in: 30,
          });
        }
      } catch { /* silent */ }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [status.is_online, activeTrip]);

  // Geolocation watch when online
  useEffect(() => {
    if (!status.is_online || !navigator.geolocation) {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      setLocationSharing(false);
      return;
    }

    setLocationSharing(true);
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await api.post('/dispatch/location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          // Also record location point if on active trip
          if (activeTrip) {
            await api.post('/dispatch/location/record', {
              trip_id: activeTrip.trip_id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }).catch(() => {});
          }
        } catch { /* silent */ }
      },
      (err) => toast.error('GPS: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [status.is_online, activeTrip?.trip_id]);

  const toggleOnline = async () => {
    try {
      const newStatus = !status.is_online;
      await api.post('/dispatch/online', { is_online: newStatus });
      setStatus(prev => ({ ...prev, is_online: newStatus, is_available: newStatus }));
      toast.success(newStatus ? 'You are now online 🟢' : 'You are now offline 🔴');
    } catch { toast.error('Failed to update status'); }
  };

  const updateTripStatus = async (newStatus: string) => {
    if (!activeTrip) return;
    try {
      await api.post('/dispatch/trip/status', { trip_id: activeTrip.trip_id, status: newStatus });
      toast.success(`Status: ${newStatus}`);
      if (newStatus === 'completed') {
        setActiveTrip(null);
        setStatus(prev => ({ ...prev, is_available: true }));
      } else {
        loadDriverData();
      }
    } catch { toast.error('Failed to update status'); }
  };

  const handleAcceptOffer = (requestId: string) => {
    setIncomingOffer(null);
    loadDriverData();
  };

  const handleDeclineOffer = () => { setIncomingOffer(null); };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-400 font-bold">Loading driver app...</p>
        </div>
      </div>
    );
  }

  const driverLocation = status.latitude && status.longitude ? { lat: status.latitude, lng: status.longitude } : null;
  const tripPickup = activeTrip?.pickup_lat && activeTrip?.pickup_lng ? { lat: activeTrip.pickup_lat, lng: activeTrip.pickup_lng, address: activeTrip.pickup_address } : null;
  const tripDropoff = activeTrip?.dropoff_lat && activeTrip?.dropoff_lng ? { lat: activeTrip.dropoff_lat, lng: activeTrip.dropoff_lng, address: activeTrip.dropoff_address } : null;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      
      <div className="bg-black/90 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-teal-400"><EmojiIcon emoji="🚕" size={18} /> Driver</h1>
            <p className="text-xs text-ink-500">{user?.name} {locationSharing && <span className="text-green-400">. GPS Active</span>}</p>
          </div>
          <button onClick={toggleOnline}
            className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all ${
              status.is_online ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-teal-500 text-white hover:bg-teal-400'
            }`}>
            {status.is_online ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status.is_online ? 'bg-teal-400 animate-pulse' : 'bg-ink-600'}`} />
          <span className="text-xs text-ink-500">{status.is_online ? (activeTrip ? 'On trip' : 'Available for rides') : 'Offline'}</span>
        </div>
      </div>

      
      {activeTab === 'home' && (
        <div className="p-4 space-y-4">
          
          {activeTrip && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-teal-600/20 to-teal-700/20 border border-teal-500/20 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase">{activeTrip.status.replace('_', ' ')}</span>
                <span className="text-xl font-black text-teal-400">${activeTrip.fare_amount}</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-teal-400 mt-0.5 text-xs">●</span>
                  <p className="text-sm text-white">{activeTrip.pickup_address}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 text-xs">●</span>
                  <p className="text-sm text-white">{activeTrip.dropoff_address}</p>
                </div>
              </div>
              {activeTrip.rider_phone && (
                <a href={`tel:${activeTrip.rider_phone}`} className="block w-full py-2.5 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-center mb-3"><EmojiIcon emoji="📞" size={16} /> Call Rider</a>
              )}
              
              <div className="flex gap-2">
                {activeTrip.status === 'assigned' && (
                  <button onClick={() => updateTripStatus('arrived')} className="flex-1 py-3 bg-teal-500 rounded-xl font-black uppercase text-sm">I Arrived</button>
                )}
                {activeTrip.status === 'arrived' && (
                  <button onClick={() => updateTripStatus('picked_up')} className="flex-1 py-3 bg-teal-500 rounded-xl font-black uppercase text-sm">Picked Up</button>
                )}
                {activeTrip.status === 'picked_up' && (
                  <button onClick={() => updateTripStatus('in_transit')} className="flex-1 py-3 bg-teal-500 rounded-xl font-black uppercase text-sm">Start Trip</button>
                )}
                {activeTrip.status === 'in_transit' && (
                  <button onClick={() => updateTripStatus('completed')} className="flex-1 py-3 bg-green-500 rounded-xl font-black uppercase text-sm">Complete Trip</button>
                )}
              </div>
            </motion.div>
          )}

          
          {!activeTrip && status.is_online && (
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-8 text-center">
              <EmojiIcon emoji="🚗" size={48} className="text-5xl mb-3" />
              <p className="text-white font-bold">Waiting for ride requests...</p>
              <p className="text-xs text-ink-500 mt-1">Stay online to receive dispatch offers</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs text-teal-400">Listening for offers</span>
              </div>
            </div>
          )}

          
          {!status.is_online && (
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-8 text-center">
              <EmojiIcon emoji="😴" size={48} className="text-5xl mb-3" />
              <p className="text-white font-bold">You are offline</p>
              <p className="text-xs text-ink-500 mt-1">Go online to start receiving ride requests</p>
            </div>
          )}

          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ink-900/60 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-teal-400">{status.vehicle_type || '—'}</p>
              <p className="text-[10px] text-ink-500 uppercase tracking-wider mt-1">Vehicle</p>
            </div>
            <div className="bg-ink-900/60 border border-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-teal-400">{status.vehicle_plate || '—'}</p>
              <p className="text-[10px] text-ink-500 uppercase tracking-wider mt-1">Plate</p>
            </div>
          </div>
        </div>
      )}

      
      {activeTab === 'map' && (
        <div className="h-[calc(100vh-180px)] relative">
          <LiveTrackingMap
            center={driverLocation || { lat: 17.2948, lng: -62.7261 }}
            zoom={14}
            height="100%"
            driver={driverLocation ? { id: 'me', name: 'You', lat: driverLocation.lat, lng: driverLocation.lng, icon: (status.vehicle_type as string) || 'car' } : null}
            pickup={tripPickup}
            dropoff={tripDropoff}
            routePolyline={
              driverLocation && tripPickup && tripDropoff
                ? [
                    { lat: driverLocation.lat, lng: driverLocation.lng },
                    { lat: tripPickup.lat, lng: tripPickup.lng },
                    { lat: tripDropoff.lat, lng: tripDropoff.lng },
                  ]
                : driverLocation && tripPickup
                  ? [{ lat: driverLocation.lat, lng: driverLocation.lng }, { lat: tripPickup.lat, lng: tripPickup.lng }]
                  : []
            }
          />
        </div>
      )}

      
      {activeTab === 'earnings' && (
        <DriverEarnings />
      )}

      
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/5 p-2 flex justify-around z-50">
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'map', icon: '🗺️', label: 'Map' },
          { id: 'earnings', icon: '💰', label: 'Earnings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'text-teal-400' : 'text-ink-500'}`}>
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      
      <IncomingRideModal
        isOpen={!!incomingOffer}
        request={incomingOffer ? {
          id: incomingOffer.request_id,
          title: `${incomingOffer.pickup} → ${incomingOffer.dropoff}`,
          service_type: 'taxi',
          pickup_location: { address: incomingOffer.pickup },
          dropoff_location: { address: incomingOffer.dropoff },
          price: incomingOffer.fare,
          distance: parseFloat(incomingOffer.distance),
          created_at: new Date().toISOString(),
        } : null}
        onAccept={handleAcceptOffer}
        onDecline={handleDeclineOffer}
        autoCloseSeconds={30}
      />
    </div>
  );
}

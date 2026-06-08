'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  description: string;
  basePrice: number;
  perKmRate: number;
  capacity: number;
  eta: string;
}

interface FareEstimate {
  distance: number;
  duration: number;
  baseFare: number;
  distanceFare: number;
  total: number;
  currency: string;
}

interface Place {
  address: string;
  lat: number;
  lng: number;
}

// ─── Vehicle Types ────────────────────────────────────────────────────────────

const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: '🚕',
    description: 'Affordable everyday rides',
    basePrice: 8,
    perKmRate: 2.5,
    capacity: 4,
    eta: '3-5 min',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: '🚗',
    description: 'Newer vehicles, top-rated drivers',
    basePrice: 12,
    perKmRate: 3.5,
    capacity: 4,
    eta: '5-8 min',
  },
  {
    id: 'suv',
    name: 'SUV',
    icon: '🚙',
    description: 'Extra space for groups & luggage',
    basePrice: 15,
    perKmRate: 4.0,
    capacity: 6,
    eta: '8-12 min',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: '🏎️',
    description: 'Premium vehicles, professional drivers',
    basePrice: 25,
    perKmRate: 6.0,
    capacity: 4,
    eta: '10-15 min',
  },
];

// ─── Popular Locations ───────────────────────────────────────────────────────

const POPULAR_LOCATIONS = [
  { name: 'Robert L. Bradshaw Airport', address: 'Basseterre, St. Kitts', lat: 17.3112, lng: -62.7180 },
  { name: 'Frigate Bay Beach', address: 'Frigate Bay, St. Kitts', lat: 17.2869, lng: -62.7275 },
  { name: 'Port Zante', address: 'Basseterre, St. Kitts', lat: 17.3000, lng: -62.7333 },
  { name: 'Basseterre City Center', address: 'Basseterre, St. Kitts', lat: 17.3026, lng: -62.7170 },
  { name: 'Pinneys Beach', address: 'Nevis', lat: 17.1550, lng: -62.5850 },
  { name: 'Charlestown', address: 'Nevis', lat: 17.1370, lng: -62.6230 },
  { name: 'Brimstone Hill Fortress', address: 'St. Kitts', lat: 17.3467, lng: -62.8380 },
  { name: 'Romney Manor', address: 'St. Kitts', lat: 17.3200, lng: -62.7500 },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RequestRidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Flow state
  const [step, setStep] = useState<'pickup' | 'dropoff' | 'vehicle' | 'confirm'>('pickup');
  const [pickup, setPickup] = useState<Place | null>(null);
  const [dropoff, setDropoff] = useState<Place | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Filter suggestions
  const pickupSuggestions = POPULAR_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(pickupQuery.toLowerCase()) ||
    l.address.toLowerCase().includes(pickupQuery.toLowerCase())
  );
  const dropoffSuggestions = POPULAR_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(dropoffQuery.toLowerCase()) ||
    l.address.toLowerCase().includes(dropoffQuery.toLowerCase())
  );

  // Calculate fare estimate when vehicle + route selected
  useEffect(() => {
    if (pickup && dropoff && selectedVehicle) {
      // Simple distance calculation (would use actual routing API in production)
      const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const duration = Math.ceil(distance * 3); // ~3 min per km
      const distanceFare = distance * selectedVehicle.perKmRate;
      const total = selectedVehicle.basePrice + distanceFare;

      setFareEstimate({
        distance: Math.round(distance * 10) / 10,
        duration,
        baseFare: selectedVehicle.basePrice,
        distanceFare: Math.round(distanceFare * 100) / 100,
        total: Math.round(total * 100) / 100,
        currency: 'XCD',
      });
    }
  }, [pickup, dropoff, selectedVehicle]);

  const handleSelectPickup = (place: typeof POPULAR_LOCATIONS[0]) => {
    setPickup({ address: `${place.name}, ${place.address}`, lat: place.lat, lng: place.lng });
    setPickupQuery(`${place.name}, ${place.address}`);
    setShowPickupSuggestions(false);
    if (!dropoff) {
      setStep('dropoff');
    }
  };

  const handleSelectDropoff = (place: typeof POPULAR_LOCATIONS[0]) => {
    setDropoff({ address: `${place.name}, ${place.address}`, lat: place.lat, lng: place.lng });
    setDropoffQuery(`${place.name}, ${place.address}`);
    setShowDropoffSuggestions(false);
    setStep('vehicle');
  };

  const handleSelectVehicle = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setStep('confirm');
  };

  const handleRequestRide = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/request-ride`);
      return;
    }
    if (!pickup || !dropoff || !selectedVehicle || !fareEstimate) return;

    setRequesting(true);
    try {
      await api.post('/rides/request', {
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        vehicle_type: selectedVehicle.id,
        estimated_fare: fareEstimate.total,
        estimated_distance: fareEstimate.distance,
        estimated_duration: fareEstimate.duration,
      });
      toast.success('Ride requested! Finding a driver...');
      router.push('/rides/active');
    } catch (error) {
      console.error('Failed to request ride:', error);
      toast.error('Failed to request ride. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* ── Header ── */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/transport" className="flex items-center gap-2 text-ink-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Request a Ride</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ── Progress Steps ── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['pickup', 'dropoff', 'vehicle', 'confirm'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s ? 'bg-yellow-400 text-black' :
                (['pickup', 'dropoff', 'vehicle', 'confirm'].indexOf(step) > i) ? 'bg-yellow-400/20 text-yellow-400' :
                'bg-white/5 text-ink-500'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                step === s ? 'text-yellow-400' : 'text-ink-500'
              }`}>
                {s === 'pickup' ? 'Pickup' : s === 'dropoff' ? 'Drop-off' : s === 'vehicle' ? 'Vehicle' : 'Confirm'}
              </span>
              {i < 3 && <div className={`w-8 h-0.5 ${['pickup', 'dropoff', 'vehicle', 'confirm'].indexOf(step) > i ? 'bg-yellow-400/30' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Pickup Location ── */}
        <AnimatePresence mode="wait">
          {step === 'pickup' && (
            <motion.div key="pickup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Where are you?</h2>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-400 border-2 border-green-400/30" />
                  <input
                    type="text"
                    value={pickupQuery}
                    onChange={e => { setPickupQuery(e.target.value); setShowPickupSuggestions(true); }}
                    onFocus={() => setShowPickupSuggestions(true)}
                    placeholder="Enter pickup location"
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-ink-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all outline-none text-lg"
                  />
                  {showPickupSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-ink-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 max-h-64 overflow-y-auto">
                      {pickupSuggestions.map((place, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectPickup(place)}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                        >
                          <span className="text-lg">📍</span>
                          <div>
                            <div className="text-white font-medium text-sm">{place.name}</div>
                            <div className="text-ink-500 text-xs">{place.address}</div>
                          </div>
                        </button>
                      ))}
                      {pickupSuggestions.length === 0 && (
                        <div className="px-4 py-3 text-ink-500 text-sm">No locations found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick locations */}
                <div className="mt-4">
                  <p className="text-xs text-ink-500 uppercase tracking-wider mb-2">Popular</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LOCATIONS.slice(0, 4).map((place, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectPickup(place)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-ink-300 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {place.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Drop-off Location ── */}
          {step === 'dropoff' && (
            <motion.div key="dropoff" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setStep('pickup')} className="text-ink-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-white">Where to?</h2>
                </div>

                {/* Show selected pickup */}
                <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-green-400/10 border border-green-400/20 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-green-400 truncate">{pickup?.address}</span>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-400 border-2 border-red-400/30" />
                  <input
                    type="text"
                    value={dropoffQuery}
                    onChange={e => { setDropoffQuery(e.target.value); setShowDropoffSuggestions(true); }}
                    onFocus={() => setShowDropoffSuggestions(true)}
                    placeholder="Enter destination"
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder-ink-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all outline-none text-lg"
                    autoFocus
                  />
                  {showDropoffSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-ink-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 max-h-64 overflow-y-auto">
                      {dropoffSuggestions.map((place, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectDropoff(place)}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                        >
                          <span className="text-lg">📍</span>
                          <div>
                            <div className="text-white font-medium text-sm">{place.name}</div>
                            <div className="text-ink-500 text-xs">{place.address}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick destinations */}
                <div className="mt-4">
                  <p className="text-xs text-ink-500 uppercase tracking-wider mb-2">Popular destinations</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LOCATIONS.filter(l => pickup && l.name !== pickup.address.split(',')[0]).slice(0, 4).map((place, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectDropoff(place)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-ink-300 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {place.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Vehicle Selection ── */}
          {step === 'vehicle' && (
            <motion.div key="vehicle" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setStep('dropoff')} className="text-ink-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-white">Choose your ride</h2>
                </div>

                {/* Route summary */}
                <div className="flex items-center gap-3 mb-6 px-3 py-3 bg-white/5 rounded-lg">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <div className="w-0.5 h-6 bg-white/20" />
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-green-400 truncate">{pickup?.address}</div>
                    <div className="text-sm text-red-400 truncate mt-1">{dropoff?.address}</div>
                  </div>
                </div>

                {/* Vehicle options */}
                <div className="space-y-3">
                  {VEHICLE_TYPES.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleSelectVehicle(vehicle)}
                      className="w-full p-4 bg-black/40 border border-white/5 rounded-xl hover:border-yellow-400/30 hover:bg-black/60 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{vehicle.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{vehicle.name}</span>
                            <span className="text-xs text-ink-500">·</span>
                            <span className="text-xs text-ink-500">{vehicle.capacity} seats</span>
                          </div>
                          <p className="text-xs text-ink-500 mt-0.5">{vehicle.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-yellow-400">~${(vehicle.basePrice + vehicle.perKmRate * 5).toFixed(0)}</div>
                          <div className="text-xs text-ink-500">{vehicle.eta}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Confirm & Request ── */}
          {step === 'confirm' && selectedVehicle && fareEstimate && (
            <motion.div key="confirm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep('vehicle')} className="text-ink-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-white">Confirm your ride</h2>
                </div>

                {/* Vehicle */}
                <div className="flex items-center gap-4 p-4 bg-black/40 border border-white/5 rounded-xl mb-4">
                  <div className="text-3xl">{selectedVehicle.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{selectedVehicle.name}</div>
                    <div className="text-xs text-ink-500">{selectedVehicle.capacity} seats · {selectedVehicle.eta}</div>
                  </div>
                  <div className="text-lg font-bold text-yellow-400">${fareEstimate.total.toFixed(2)}</div>
                </div>

                {/* Route */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <div className="w-0.5 h-8 bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{pickup?.address}</div>
                      <div className="text-sm text-white font-medium mt-3">{dropoff?.address}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ink-500">
                    <span>📍 {fareEstimate.distance} km</span>
                    <span>⏱ {fareEstimate.duration} min</span>
                  </div>
                </div>

                {/* Fare breakdown */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink-400">Base fare</span>
                    <span className="text-white">${fareEstimate.baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink-400">Distance ({fareEstimate.distance} km)</span>
                    <span className="text-white">${fareEstimate.distanceFare.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-yellow-400 font-bold text-lg">${fareEstimate.total.toFixed(2)} {fareEstimate.currency}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">💳</span>
                      <div>
                        <div className="text-sm text-white font-medium">Payment</div>
                        <div className="text-xs text-ink-500">Pay on arrival or prepay</div>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-400 font-medium">Change</span>
                  </div>
                </div>

                {/* Request button */}
                <button
                  onClick={handleRequestRide}
                  disabled={requesting}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requesting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Finding a driver...
                    </span>
                  ) : (
                    `Request ${selectedVehicle.name} • $${fareEstimate.total.toFixed(2)}`
                  )}
                </button>

                <p className="text-xs text-ink-500 text-center mt-3">
                  🔒 Free cancellation up to 5 minutes after booking
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Helper: Calculate distance between two points (km) ──────────────────────

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

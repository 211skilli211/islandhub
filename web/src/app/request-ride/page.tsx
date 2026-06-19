'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import Link from 'next/link';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { id: 'ride', label: 'Ride', icon: '🚕', desc: 'Get a ride' },
  { id: 'delivery', label: 'Delivery', icon: '📦', desc: 'Send packages' },
  { id: 'boat', label: 'Boat', icon: '🚤', desc: 'Water transport' },
  { id: 'moving', label: 'Moving', icon: '🚚', desc: 'Relocation' },
];

const RIDE_TYPES = [
  { id: 'standard', name: 'Standard', icon: '🚕', desc: 'Affordable rides', basePrice: 8, perKm: 2.5, capacity: 4, eta: '3-5 min', color: 'teal' },
  { id: 'premium', name: 'Premium', icon: '🚗', desc: 'Top-rated drivers', basePrice: 12, perKm: 3.5, capacity: 4, eta: '5-8 min', color: 'sky' },
  { id: 'suv', name: 'SUV', icon: '🚙', desc: 'More space', basePrice: 15, perKm: 4.0, capacity: 6, eta: '8-12 min', color: 'emerald' },
  { id: 'luxury', name: 'Luxury', icon: '🏎️', desc: 'Premium experience', basePrice: 25, perKm: 6.0, capacity: 4, eta: '10-15 min', color: 'amber' },
];

const POPULAR_DESTINATIONS = [
  { name: 'Robert L. Bradshaw Airport', address: 'Basseterre, St. Kitts', lat: 17.3112, lng: -62.7180 },
  { name: 'Frigate Bay Beach', address: 'Frigate Bay, St. Kitts', lat: 17.2869, lng: -62.7275 },
  { name: 'Port Zante', address: 'Basseterre, St. Kitts', lat: 17.3000, lng: -62.7333 },
  { name: 'Basseterre City Center', address: 'Basseterre, St. Kitts', lat: 17.3026, lng: -62.7170 },
  { name: 'Pinneys Beach', address: 'Nevis', lat: 17.1550, lng: -62.5850 },
  { name: 'Charlestown', address: 'Nevis', lat: 17.1370, lng: -62.6230 },
  { name: 'Brimstone Hill Fortress', address: 'St. Kitts', lat: 17.3467, lng: -62.8380 },
  { name: 'Romney Manor', address: 'St. Kitts', lat: 17.3200, lng: -62.7500 },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RequestRidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Service & vehicle selection
  const [serviceType, setServiceType] = useState('ride');
  const [selectedRideType, setSelectedRideType] = useState(RIDE_TYPES[0]);

  // Locations
  const [pickup, setPickup] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [dropoff, setDropoff] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [pickupInput, setPickupInput] = useState('');
  const [dropoffInput, setDropoffInput] = useState('');
  const [showPickupDrop, setShowPickupDrop] = useState(false);
  const [showDropoffDrop, setShowDropoffDrop] = useState(false);
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff'>('dropoff');

  // Booking options
  const [passengers, setPassengers] = useState(1);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // State
  const [requesting, setRequesting] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  // Fare estimate
  const fareEstimate = useMemo(() => {
    if (!pickup || !dropoff || !selectedRideType) return null;
    const distance = Math.round(haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng) * 10) / 10;
    const duration = Math.ceil(distance * 3);
    const distanceFare = distance * selectedRideType.perKm;
    const total = selectedRideType.basePrice + distanceFare;
    return {
      distance,
      duration,
      baseFare: selectedRideType.basePrice,
      distanceFare: Math.round(distanceFare * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency: 'XCD',
    };
  }, [pickup, dropoff, selectedRideType]);

  // Filter destinations
  const filteredDestinations = (query: string) =>
    POPULAR_DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.address.toLowerCase().includes(query.toLowerCase())
    );

  const handleSelectDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    const loc = { address: `${dest.name}, ${dest.address}`, lat: dest.lat, lng: dest.lng };
    if (activeInput === 'pickup') {
      setPickup(loc);
      setPickupInput(`${dest.name}, ${dest.address}`);
      setShowPickupDrop(false);
    } else {
      setDropoff(loc);
      setDropoffInput(`${dest.name}, ${dest.address}`);
      setShowDropoffDrop(false);
    }
  };

  const handleRequest = async () => {
    if (!isAuthenticated) { router.push(`/login?redirect=/request-ride`); return; }
    if (!pickup || !dropoff || !fareEstimate) return;
    setRequesting(true);
    try {
      await api.post('/rides/request', {
        service_type: serviceType,
        pickup_address: pickup.address, pickup_lat: pickup.lat, pickup_lng: pickup.lng,
        dropoff_address: dropoff.address, dropoff_lat: dropoff.lat, dropoff_lng: dropoff.lng,
        ride_type: selectedRideType.id,
        passengers,
        scheduled_at: scheduleType === 'later' ? `${scheduledDate} ${scheduledTime}` : null,
        estimated_fare: fareEstimate.total,
        estimated_distance: fareEstimate.distance,
        estimated_duration: fareEstimate.duration,
      });
      toast.success('Ride booked! Finding your driver...');
      router.push('/rides/active');
    } catch {
      toast.error('Failed to book ride. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const canProceed = pickup && dropoff && selectedRideType;

  return (
    <main className="min-h-screen bg-black">
      
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/transport" className="flex items-center gap-2 text-ink-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Book a Ride</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          
          <div className="lg:col-span-5 space-y-4">

            
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-2 block">Service Type</label>
              <div className="grid grid-cols-4 gap-2">
                {SERVICE_TYPES.map(st => (
                  <button key={st.id} onClick={() => setServiceType(st.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      serviceType === st.id ? 'bg-yellow-400/10 border border-yellow-400/30 text-yellow-400' : 'bg-white/5 border border-white/5 text-ink-400 hover:bg-white/10'
                    }`}>
                    <span className="text-xl">{st.icon}</span>
                    <span className="text-xs font-medium">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-3 block">Where to?</label>

              
              <div className="relative flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center gap-1 pt-3">
                  <div className="w-3 h-3 rounded-full border-2 border-green-400 bg-green-400/20" />
                  <div className="w-0.5 h-10 bg-white/10" />
                  <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-400/20" />
                </div>
                <div className="flex-1 space-y-2">
                  
                  <div className="relative">
                    <input
                      type="text" value={pickupInput}
                      onChange={e => { setPickupInput(e.target.value); setActiveInput('pickup'); setShowPickupDrop(true); }}
                      onFocus={() => { setActiveInput('pickup'); setShowPickupDrop(true); setShowDropoffDrop(false); }}
                      placeholder="Pickup location"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-ink-500 focus:border-green-400/50 focus:ring-1 focus:ring-green-400/20 outline-none text-sm"
                    />
                    {showPickupDrop && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-ink-900 border border-white/10 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto">
                        {filteredDestinations(pickupInput).map((d, i) => (
                          <button key={i} onClick={() => handleSelectDestination(d)} className="w-full px-3 py-2.5 text-left hover:bg-white/5 flex items-center gap-2 border-b border-white/5 last:border-0">
                            <span className="text-green-400 text-xs">●</span>
                            <div><div className="text-white text-sm font-medium">{d.name}</div><div className="text-ink-500 text-xs">{d.address}</div></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text" value={dropoffInput}
                      onChange={e => { setDropoffInput(e.target.value); setActiveInput('dropoff'); setShowDropoffDrop(true); }}
                      onFocus={() => { setActiveInput('dropoff'); setShowDropoffDrop(true); setShowPickupDrop(false); }}
                      placeholder="Where to?"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-ink-500 focus:border-red-400/50 focus:ring-1 focus:ring-red-400/20 outline-none text-sm"
                    />
                    {showDropoffDrop && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-ink-900 border border-white/10 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto">
                        {POPULAR_DESTINATIONS.filter(d => d.name.toLowerCase().includes(dropoffInput.toLowerCase()) || d.address.toLowerCase().includes(dropoffInput.toLowerCase())).map((d, i) => (
                          <button key={i} onClick={() => handleSelectDestination(d)} className="w-full px-3 py-2.5 text-left hover:bg-white/5 flex items-center gap-2 border-b border-white/5 last:border-0">
                            <span className="text-red-400 text-xs">●</span>
                            <div><div className="text-white text-sm font-medium">{d.name}</div><div className="text-ink-500 text-xs">{d.address}</div></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.slice(0, 5).map((d, i) => (
                  <button key={i} onClick={() => handleSelectDestination(d)}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-ink-300 hover:bg-white/10 hover:text-white transition-all">
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-3 block">Ride Type</label>
              <div className="space-y-2">
                {RIDE_TYPES.map(rt => (
                  <button key={rt.id} onClick={() => setSelectedRideType(rt.id === selectedRideType.id ? selectedRideType : rt)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedRideType.id === rt.id ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                    }`}>
                    <div className="text-2xl w-10 text-center">{rt.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{rt.name}</span>
                        <span className="text-xs text-ink-500">. {rt.capacity} seats</span>
                      </div>
                      <div className="text-xs text-ink-400">{rt.desc} . ETA {rt.eta}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-400">${rt.basePrice}+</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-3 block">Booking Options</label>

              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <EmojiIcon emoji="👥" size={18} className="text-lg" />
                  <div><div className="text-sm text-white font-medium">Passengers</div><div className="text-xs text-ink-500">How many people?</div></div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 text-sm">−</button>
                  <span className="text-white font-bold w-4 text-center">{passengers}</span>
                  <button onClick={() => setPassengers(Math.min(6, passengers + 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 text-sm">+</button>
                </div>
              </div>

              
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setScheduleType('now')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${scheduleType === 'now' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-ink-400 border border-white/5'}`}>Ride Now</button>
                <button onClick={() => setScheduleType('later')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${scheduleType === 'later' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-ink-400 border border-white/5'}`}>Schedule</button>
              </div>

              {scheduleType === 'later' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-2">
                  <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-yellow-400/50 outline-none" />
                  <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-yellow-400/50 outline-none" />
                </motion.div>
              )}
            </div>
          </div>

          
          <div className="lg:col-span-7 space-y-4">

            
            <div className="bg-ink-900/60 border border-white/5 rounded-2xl overflow-hidden" style={{ height: '45vh' }}>
              <div className="h-full relative">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center"><EmojiIcon emoji="🗺️" size={48} className="text-6xl mb-2" /><p className="text-ink-500 text-sm">Live map</p></div>
                </div>
                
                {pickup && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400 font-medium max-w-[200px] truncate">{pickup.address}</span>
                  </div>
                )}
                {dropoff && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-red-400 font-medium max-w-[200px] truncate">{dropoff.address}</span>
                  </div>
                )}
              </div>
            </div>

            
            {fareEstimate && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedRideType.icon}</span>
                    <div><div className="text-sm font-bold text-white">{selectedRideType.name}</div><div className="text-xs text-ink-500">{fareEstimate.distance} km . ~{fareEstimate.duration} min</div></div>
                  </div>
                  <div className="text-xl font-bold text-yellow-400">${fareEstimate.total.toFixed(2)} <span className="text-xs text-ink-500">XCD</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="bg-white/5 rounded-lg py-2"><div className="text-ink-400">Distance</div><div className="text-white font-bold">{fareEstimate.distance} km</div></div>
                  <div className="bg-white/5 rounded-lg py-2"><div className="text-ink-400">Duration</div><div className="text-white font-bold">~{fareEstimate.duration} min</div></div>
                  <div className="bg-white/5 rounded-lg py-2"><div className="text-ink-400">Passengers</div><div className="text-white font-bold">{passengers}</div></div>
                </div>
              </motion.div>
            )}

            
            <button onClick={handleRequest} disabled={!canProceed || requesting}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/20 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {requesting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Finding driver...
                </span>
              ) : !canProceed ? (
                <span>Select pickup & drop-off</span>
              ) : fareEstimate ? (
                <span>Book {selectedRideType.name} . ${fareEstimate.total.toFixed(2)} {fareEstimate.currency}</span>
              ) : null}
            </button>

            <EmojiIcon emoji="🔒" size={16} className="text-xs text-ink-600 text-center" />
          </div>
        </div>
      </div>
    </main>
  );
}

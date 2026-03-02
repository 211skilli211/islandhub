'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import MapWithErrorBoundary from '@/components/Map/MapWithErrorBoundary';



// Helper: Haversine Distance Formula (Km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// Vehicle Categories Configuration
// Vehicle Metadata & Config
const VEHICLE_CONFIG: any = {
    taxi: { label: 'Taxi', valid: ['car', 'suv'] },
    pickup: { label: 'Pickup', valid: ['car', 'suv', 'truck'] },
    delivery: { label: 'Delivery', valid: ['scooter', 'car', 'suv', 'truck'] }
};

const VEHICLE_DETAILS: any = {
    scooter: {
        label: 'Scooter',
        icon: '🛵',
        desc: 'Fast & small'
    },
    car: {
        label: 'Sedan',
        icon: '🚗',
        desc: 'Standard ride'
    },
    suv: {
        label: 'SUV',
        icon: '🚙',
        desc: 'More space'
    },
    truck: {
        label: 'Truck',
        icon: '🚚',
        desc: 'Large cargo'
    }
};

const BASE_FARES: any = {
    scooter: 15,
    car: 25,
    suv: 35,
    truck: 50
};

const PER_KM_RATES: any = {
    scooter: 2,
    car: 3,
    suv: 4,
    truck: 5
};

export default function RequestRidePage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialType = searchParams.get('type') || 'taxi';

    const [loading, setLoading] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);

    // Hero Asset State (fetched from admin config)
    const [heroAsset, setHeroAsset] = useState<{
        asset_url?: string;
        asset_type?: 'image' | 'video';
        overlay_color?: string;
        overlay_opacity?: number;
    } | null>(null);

    // Fetch hero asset configuration
    useEffect(() => {
        const fetchHeroAsset = async () => {
            try {
                const res = await api.get('/admin/hero-assets/taxi-hub');
                if (res.data) {
                    setHeroAsset(res.data);
                }
            } catch (error) {
                // Silently fail, use default hero
            }
        };
        fetchHeroAsset();
    }, []);

    // Form State
    const [serviceType, setServiceType] = useState(initialType);
    const [vehicleCategory, setVehicleCategory] = useState(VEHICLE_CONFIG[initialType]?.valid[0] || 'car');

    // Location State
    const [pickupLocation, setPickupLocation] = useState({ address: '', lat: 17.2948, lng: -62.7177 }); // Default: Basseterre
    const [dropoffLocation, setDropoffLocation] = useState({ address: '', lat: 0, lng: 0 });
    const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff'>('pickup');

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    // Pricing State
    const [distance, setDistance] = useState(0);
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [customPrice, setCustomPrice] = useState('');

    // Extra Details State
    const [passengerCount, setPassengerCount] = useState(1);
    const [luggageSize, setLuggageSize] = useState<'Small' | 'Large'>('Small');
    const [notes, setNotes] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledTime, setScheduledTime] = useState('');

    // Helper references for blur handling
    const containerRef = useRef<HTMLDivElement>(null);

    // Effect: Handle click outside for closing autocomplete
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeInput && !(event.target as HTMLElement).closest('.autocomplete-container')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeInput]);

    // Effect: Update vehicle on service change
    useEffect(() => {
        const validVehicles = VEHICLE_CONFIG[serviceType]?.valid || [];
        if (!validVehicles.includes(vehicleCategory)) {
            setVehicleCategory(validVehicles[0]);
        }
    }, [serviceType]);

    // Effect: Calculate Price
    useEffect(() => {
        if (pickupLocation.lat && dropoffLocation.lat && distance > 0) {
            const base = BASE_FARES[vehicleCategory] || 25;
            const rate = PER_KM_RATES[vehicleCategory] || 3;
            const price = base + (distance * rate);
            setEstimatedPrice(Math.round(price));
            setCustomPrice(Math.round(price).toString());
        }
    }, [distance, vehicleCategory]);

    // Nominatim Autocomplete
    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=kn&limit=5`);
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (e) {
            console.error("Geocoding error", e);
        }
    };

    const handleSelectSuggestion = (place: any) => {
        const newLoc = {
            address: place.display_name.split(',')[0], // Simplified name
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon)
        };

        if (activeInput === 'pickup') {
            setPickupLocation(newLoc);
        } else {
            setDropoffLocation(newLoc);
            // Calculate distance immediately if pickup handles
            if (pickupLocation.lat) {
                const dist = calculateDistance(pickupLocation.lat, pickupLocation.lng, newLoc.lat, newLoc.lng);
                setDistance(dist);
            }
        }
        setShowSuggestions(false);
    };

    // Address Input Handler
    const handleAddressChange = (input: 'pickup' | 'dropoff', val: string) => {
        setActiveInput(input);
        if (input === 'pickup') setPickupLocation(prev => ({ ...prev, address: val }));
        else setDropoffLocation(prev => ({ ...prev, address: val }));

        fetchSuggestions(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                toast.error('Please login to request a ride');
                router.push('/login');
                return;
            }

            const extraDetails = {
                passenger_count: passengerCount,
                item_size: luggageSize,
                notes: notes,
                is_delivery: serviceType === 'delivery',
                is_pickup: serviceType === 'pickup',
                is_taxi: serviceType === 'taxi'
            };

            const pricingDetails = {
                distance: parseFloat(distance.toFixed(2)),
                estimated_fare: estimatedPrice,
                custom_offer: parseFloat(customPrice || estimatedPrice.toString())
            };

            const payload = {
                title: `${serviceType.toUpperCase()} Request - ${vehicleCategory}`,
                description: notes || `Request for ${serviceType}`,
                price: pricingDetails.custom_offer,
                service_type: serviceType,
                vehicle_category: vehicleCategory,
                pickup_location: pickupLocation, // Sent as object, controller will stringify
                dropoff_location: dropoffLocation,
                waypoints: [],
                extra_details: extraDetails,
                pricing_details: pricingDetails,
                scheduled_time: isScheduled ? scheduledTime : null
            };

            console.log("Submitting Refined Payload:", payload);

            await api.post('/logistics/jobs', payload);
            toast.success('Request Dispatched! Drivers notified.');
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Failed to dispatch request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row bg-slate-50 min-h-screen relative">
            {/* Left Panel - Request Form */}
            <div className="w-full lg:w-[450px] bg-white z-20 shadow-2xl flex flex-col lg:h-screen overflow-y-auto relative no-scrollbar">

                {/* Hero Section - Optimized for mobile */}
                <div className="relative h-40 sm:h-48 lg:h-56 shrink-0 overflow-hidden">
                    {/* Background - Admin configured or default gradient */}
                    {heroAsset?.asset_url ? (
                        <>
                            {heroAsset.asset_type === 'video' ? (
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                >
                                    <source src={getImageUrl(heroAsset.asset_url)} type="video/mp4" />
                                </video>
                            ) : (
                                <img
                                    src={getImageUrl(heroAsset.asset_url)}
                                    alt="Hero background"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading="eager"
                                />
                            )}
                            {/* Overlay */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundColor: heroAsset.overlay_color || '#000000',
                                    opacity: heroAsset.overlay_opacity ?? 0.4
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-linear-to-br from-teal-600 via-teal-500 to-emerald-400" />
                            <div className="absolute inset-0 bg-[url('/images/taxi-pattern.png')] opacity-10" />
                        </>
                    )}

                    {/* Content - Mobile optimized */}
                    <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-8 z-10">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                            Taxi & Delivery Hub
                        </h1>
                        <p className="text-white/80 font-medium text-xs sm:text-sm mt-1 sm:mt-2">
                            Fast, reliable transport across the island
                        </p>
                    </div>

                    {/* Decorative elements - smaller on mobile */}
                    <div className="absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full z-10" />
                    <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-14 sm:w-20 h-14 sm:h-20 bg-white/5 rounded-full z-10" />
                </div>

                {/* Form - Mobile optimized padding */}
                <form onSubmit={handleSubmit} className="flex-1 px-5 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">

                    {/* Service Type Switcher */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0">
                        {['taxi', 'pickup', 'delivery'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setServiceType(type)}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${serviceType === type ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Locations */}
                    <div className="space-y-4 relative">
                        <div className="relative autocomplete-container">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block pl-2">Pickup Point</label>
                            <input
                                value={pickupLocation.address}
                                onChange={(e) => handleAddressChange('pickup', e.target.value)}
                                onFocus={() => {
                                    setActiveInput('pickup');
                                    if (pickupLocation.address.length >= 3) setShowSuggestions(true);
                                }}
                                placeholder="Search pickup location..."
                                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 outline-none transition-all ${activeInput === 'pickup' ? 'border-teal-500 bg-white' : 'border-slate-100'}`}
                            />
                            <div className={`absolute left-4 top-9 text-lg ${activeInput === 'pickup' ? 'text-teal-500' : 'text-slate-300'}`}>📍</div>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && activeInput === 'pickup' && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 mt-2 overflow-hidden border-t-0 rounded-t-none animate-in fade-in slide-in-from-top-2 duration-200">
                                    {suggestions.map((place: any, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(place)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                                        >
                                            <p className="text-sm font-bold text-slate-800 truncate">{place.display_name.split(',')[0]}</p>
                                            <p className="text-xs text-slate-400 truncate">{place.display_name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative autocomplete-container">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block pl-2">Destination</label>
                            <input
                                value={dropoffLocation.address}
                                onChange={(e) => handleAddressChange('dropoff', e.target.value)}
                                onFocus={() => {
                                    setActiveInput('dropoff');
                                    if (dropoffLocation.address.length >= 3) setShowSuggestions(true);
                                }}
                                placeholder="Where to?"
                                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 outline-none transition-all ${activeInput === 'dropoff' ? 'border-indigo-500 bg-white' : 'border-slate-100'}`}
                            />
                            <div className={`absolute left-4 top-9 text-lg ${activeInput === 'dropoff' ? 'text-indigo-500' : 'text-slate-300'}`}>🏁</div>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && activeInput === 'dropoff' && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 mt-2 overflow-hidden border-t-0 rounded-t-none animate-in fade-in slide-in-from-top-2 duration-200">
                                    {suggestions.map((place: any, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(place)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                                        >
                                            <p className="text-sm font-bold text-slate-800 truncate">{place.display_name.split(',')[0]}</p>
                                            <p className="text-xs text-slate-400 truncate">{place.display_name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    {distance > 0 && (
                        <div className="flex gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                            <div>
                                <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Est. Distance</p>
                                <p className="text-xl font-black text-teal-700">{distance.toFixed(1)} km</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Est. Fare</p>
                                <p className="text-xl font-black text-teal-700">${estimatedPrice}</p>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Selection */}
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 block pl-2">Select Vehicle</label>
                        <div className="grid grid-cols-2 gap-3">
                            {VEHICLE_CONFIG[serviceType].valid.map((v: string) => {
                                const details = VEHICLE_DETAILS[v] || { label: v, image: '', desc: '' };
                                const isSelected = vehicleCategory === v;

                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setVehicleCategory(v)}
                                        className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${isSelected
                                            ? 'border-indigo-500 bg-indigo-50/20'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start z-10 relative">
                                            <div>
                                                <div className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {details.label}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    ${BASE_FARES[v]} base
                                                </div>
                                            </div>
                                            {details.icon && (
                                                <span className="text-3xl transition-transform group-hover:scale-110">
                                                    {details.icon}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[9px] text-slate-400 mt-2 z-10 relative font-medium">
                                            {details.desc}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Extra Details Form */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block pl-2">{serviceType === 'delivery' ? 'Items' : 'Passengers'}</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={passengerCount}
                                onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block pl-2">
                                {serviceType === 'delivery' ? 'Item Size' : 'Luggage'}
                            </label>
                            <select
                                value={luggageSize}
                                onChange={(e: any) => setLuggageSize(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500 appearance-none"
                            >
                                {serviceType === 'delivery' ? (
                                    <>
                                        <option value="food_small">Food / Small Parcel</option>
                                        <option value="medium_parcel">Medium Parcel</option>
                                        <option value="large_parcel">Large / Heavy</option>
                                        <option value="big_item">Big Item (Furniture, Barrels)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Small">Small / None</option>
                                        <option value="Large">Large / Heavy</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block pl-2">Driver Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Gate code, white shirt, etc."
                            rows={2}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Offering Price Section (customPrice already exists above) */}

                    {/* Scheduling Section */}
                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📅</span>
                                <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Schedule for later</p>
                                    <p className="text-[9px] font-medium text-slate-400">Book in advance</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsScheduled(!isScheduled)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${isScheduled ? 'bg-indigo-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isScheduled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {isScheduled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="overflow-hidden"
                            >
                                <input
                                    type="datetime-local"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-800 outline-none focus:border-indigo-500"
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </motion.div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        {loading ? 'Transmitting...' : 'Dispatch Request 📡'}
                    </button>

                    {/* Mobile Map Preview - Inside form, below dispatch button */}
                    <div
                        className="lg:hidden w-full h-48 bg-slate-200 relative cursor-pointer rounded-2xl overflow-hidden shadow-lg"
                        onClick={() => setMapExpanded(true)}
                    >
                        <MapWithErrorBoundary
                            mapId="mobile-preview"
                            center={[pickupLocation.lat || 17.2948, pickupLocation.lng || -62.7177]}
                            zoom={12}
                            markers={[
                                ...(pickupLocation.lat ? [{ position: [pickupLocation.lat, pickupLocation.lng] as [number, number], label: 'Pickup' }] : []),
                                ...(dropoffLocation.lat ? [{ position: [dropoffLocation.lat, dropoffLocation.lng] as [number, number], label: 'Dropoff' }] : [])
                            ]}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full text-sm font-black uppercase tracking-wide shadow-xl flex items-center gap-2 border border-slate-200">
                                <span className="text-lg">🗺️</span> Tap to Expand
                            </span>
                        </div>
                    </div>
                </form>
            </div>

            {/* Mobile Expanded Map Overlay */}
            {mapExpanded && (
                <>
                    {/* Floating Close Button - Outside map container */}
                    <button
                        onClick={() => setMapExpanded(false)}
                        className="lg:hidden fixed top-6 right-6 z-9999 w-16 h-16 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center font-black text-3xl hover:bg-rose-50 hover:text-rose-500 transition-all border-4 border-slate-200"
                        style={{ pointerEvents: 'auto' }}
                    >
                        ✕
                    </button>
                    {/* Map Container */}
                    <div className="lg:hidden fixed inset-0 z-100 bg-slate-200">
                        <MapWithErrorBoundary
                            mapId="mobile-expanded"
                            center={[pickupLocation.lat || 17.2948, pickupLocation.lng || -62.7177]}
                            zoom={13}
                            markers={[
                                ...(pickupLocation.lat ? [{ position: [pickupLocation.lat, pickupLocation.lng] as [number, number], label: 'Pickup' }] : []),
                                ...(dropoffLocation.lat ? [{ position: [dropoffLocation.lat, dropoffLocation.lng] as [number, number], label: 'Dropoff' }] : [])
                            ]}
                        />
                    </div>
                </>
            )}

            {/* Desktop Map - Right Side */}
            <div className="hidden lg:block lg:flex-1 bg-slate-200 h-screen">
                <MapWithErrorBoundary
                    mapId="desktop-main"
                    center={[pickupLocation.lat || 17.2948, pickupLocation.lng || -62.7177]}
                    zoom={14}
                    markers={[
                        ...(pickupLocation.lat ? [{ position: [pickupLocation.lat, pickupLocation.lng] as [number, number], label: 'Pickup' }] : []),
                        ...(dropoffLocation.lat ? [{ position: [dropoffLocation.lat, dropoffLocation.lng] as [number, number], label: 'Dropoff' }] : [])
                    ]}
                />
            </div>
        </div>
    );
}

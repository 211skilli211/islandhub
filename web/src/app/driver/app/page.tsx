'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface DriverStatus {
    is_online: boolean;
    is_available: boolean;
    latitude?: number;
    longitude?: number;
    current_address?: string;
    vehicle_type?: string;
}

interface Trip {
    trip_id: string;
    pickup_address: string;
    dropoff_address: string;
    status: string;
    fare_amount: number;
    rider_name?: string;
    rider_phone?: string;
}

interface Earnings {
    total_trips: number;
    total_gross: string;
    total_fees: string;
    total_net: string;
    avg_per_trip: string;
}

export default function DriverApp() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<DriverStatus>({ is_online: false, is_available: false });
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [earnings, setEarnings] = useState<Earnings | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'trips' | 'earnings' | 'settings'>('home');
    const [locationUpdating, setLocationUpdating] = useState(false);

    useEffect(() => {
        if (isAuthenticated === false) {
            router.push('/login');
            return;
        }
        
        if (user && !user.role?.startsWith('driver_')) {
            toast.error('Driver access required');
            router.push('/');
            return;
        }

        loadDriverData();
    }, [isAuthenticated, user, router]);

    const loadDriverData = async () => {
        try {
            const [statusRes, tripRes, earningsRes] = await Promise.all([
                api.get('/drivers/status'),
                api.get('/drivers/trip/current'),
                api.get('/drivers/earnings')
            ]);

            setStatus(statusRes.data);
            setCurrentTrip(tripRes.data.trip);
            setEarnings(earningsRes.data.summary);
        } catch (error: any) {
            console.error('Failed to load driver data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOnline = async () => {
        try {
            const newStatus = !status.is_online;
            await api.post('/drivers/online', { is_online: newStatus });
            setStatus(prev => ({ ...prev, is_online: newStatus, is_available: newStatus }));
            toast.success(newStatus ? 'You are now online' : 'You are now offline');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updateLocation = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }

        setLocationUpdating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await api.post('/drivers/location', {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: 'Current Location'
                    });
                    toast.success('Location updated');
                } catch (error) {
                    toast.error('Failed to update location');
                } finally {
                    setLocationUpdating(false);
                }
            },
            (error) => {
                toast.error('Unable to get location');
                setLocationUpdating(false);
            }
        );
    };

    const acceptTrip = async (tripId: string) => {
        try {
            await api.post('/drivers/dispatch/accept', { request_id: tripId });
            toast.success('Trip accepted!');
            loadDriverData();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Failed to accept');
        }
    };

    const updateTripStatus = async (tripId: string, newStatus: string) => {
        try {
            await api.post('/drivers/trip/status', { trip_id: tripId, status: newStatus });
            toast.success(`Status: ${newStatus}`);
            loadDriverData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const callRider = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            
            {/* Header */}
            <div className="bg-slate-800 p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-teal-400">🚕 Driver</h1>
                        <p className="text-xs text-slate-400">{user?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={updateLocation}
                            disabled={locationUpdating}
                            className={`p-2 rounded-full ${locationUpdating ? 'bg-slate-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                            <span className="text-lg">📍</span>
                        </button>
                        <button 
                            onClick={toggleOnline}
                            className={`px-6 py-3 rounded-2xl font-black uppercase text-sm ${
                                status.is_online 
                                    ? 'bg-rose-500 hover:bg-rose-600' 
                                    : 'bg-teal-500 hover:bg-teal-600'
                            }`}
                        >
                            {status.is_online ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </div>
                
                {/* Status Indicator */}
                <div className="mt-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status.is_online ? 'bg-teal-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs text-slate-400">
                        {status.is_online ? 'Online & Available' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Active Trip Card */}
            {currentTrip && (
                <div className="p-4 bg-gradient-to-r from-teal-600 to-teal-700">
                    <div className="bg-slate-900/50 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase">
                                {currentTrip.status.replace('_', ' ')}
                            </span>
                            <span className="text-xl font-black">${currentTrip.fare_amount}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                                <span className="text-teal-400 mt-1">●</span>
                                <p className="text-sm">{currentTrip.pickup_address}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-rose-400 mt-1">●</span>
                                <p className="text-sm">{currentTrip.dropoff_address}</p>
                            </div>
                        </div>

                        {currentTrip.rider_phone && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => callRider(currentTrip.rider_phone!)}
                                    className="flex-1 py-2 bg-white/10 rounded-xl font-bold text-sm"
                                >
                                    📞 Call Rider
                                </button>
                            </div>
                        )}

                        {/* Trip Actions */}
                        <div className="mt-4 flex gap-2">
                            {currentTrip.status === 'assigned' && (
                                <button 
                                    onClick={() => updateTripStatus(currentTrip.trip_id, 'arrived')}
                                    className="flex-1 py-3 bg-teal-500 rounded-xl font-black uppercase text-sm"
                                >
                                    I Arrived
                                </button>
                            )}
                            {currentTrip.status === 'arrived' && (
                                <button 
                                    onClick={() => updateTripStatus(currentTrip.trip_id, 'picked_up')}
                                    className="flex-1 py-3 bg-teal-500 rounded-xl font-black uppercase text-sm"
                                >
                                    Picked Up
                                </button>
                            )}
                            {currentTrip.status === 'picked_up' && (
                                <button 
                                    onClick={() => updateTripStatus(currentTrip.trip_id, 'in_transit')}
                                    className="flex-1 py-3 bg-teal-500 rounded-xl font-black uppercase text-sm"
                                >
                                    Start Trip
                                </button>
                            )}
                            {currentTrip.status === 'in_transit' && (
                                <button 
                                    onClick={() => updateTripStatus(currentTrip.trip_id, 'completed')}
                                    className="flex-1 py-3 bg-green-500 rounded-xl font-black uppercase text-sm"
                                >
                                    Complete Trip
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* No Active Trip - Show Stats */}
            {!currentTrip && status.is_online && (
                <div className="p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-2">🚗</div>
                        <p className="text-slate-400 font-medium">Waiting for ride requests...</p>
                        <p className="text-xs text-slate-500 mt-2">Stay online to receive dispatch offers</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="p-4 grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Today&apos;s Trips</p>
                    <p className="text-2xl font-black text-teal-400">{earnings?.total_trips || 0}</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Earnings</p>
                    <p className="text-2xl font-black text-green-400">${parseFloat(earnings?.total_net || '0').toFixed(2)}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                    <Link href="/dispatch" className="bg-slate-800 rounded-2xl p-4 text-center">
                        <span className="text-2xl block mb-1">🗺️</span>
                        <span className="text-xs font-bold">Dispatch</span>
                    </Link>
                    <Link href="/driver-hub" className="bg-slate-800 rounded-2xl p-4 text-center">
                        <span className="text-2xl block mb-1">📊</span>
                        <span className="text-xs font-bold">Hub</span>
                    </Link>
                    <button onClick={loadDriverData} className="bg-slate-800 rounded-2xl p-4 text-center">
                        <span className="text-2xl block mb-1">🔄</span>
                        <span className="text-xs font-bold">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2 flex justify-around">
                {[
                    { id: 'home', icon: '🏠', label: 'Home' },
                    { id: 'trips', icon: '📋', label: 'Trips' },
                    { id: 'earnings', icon: '💰', label: 'Earnings' },
                    { id: 'settings', icon: '⚙️', label: 'Settings' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center p-2 rounded-xl ${
                            activeTab === tab.id ? 'text-teal-400' : 'text-slate-400'
                        }`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-[10px] font-bold">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="h-20" />
        </div>
    );
}
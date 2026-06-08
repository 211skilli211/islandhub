'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface TripStatus {
  trip_id: string;
  status: 'pending' | 'assigned' | 'arrived' | 'picked_up' | 'in_transit' | 'completed' | 'cancelled';
  driver_name?: string;
  driver_vehicle?: string;
  driver_plate?: string;
  driver_lat?: number;
  driver_lng?: number;
  pickup_address?: string;
  dropoff_address?: string;
  fare_amount?: number;
  eta_minutes?: number;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
}

/**
 * Hook for real-time ride tracking.
 * Polls the server for driver location and trip status.
 */
export function useRideTracking(tripId: string | null, pollIntervalMs = 8000) {
  const [trip, setTrip] = useState<TripStatus | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<DriverLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const historyRef = useRef<DriverLocation[]>([]);

  const fetchStatus = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await api.get(`/rides/tracking/${tripId}`);
      const data = res.data;
      setTrip(data.trip);
      setError('');

      if (data.driver_location?.lat && data.driver_location?.lng) {
        const loc = { lat: data.driver_location.lat, lng: data.driver_location.lng, timestamp: new Date().toISOString() };
        setDriverLocation(loc);
        historyRef.current = [...historyRef.current.slice(-99), loc];
        setLocationHistory([...historyRef.current]);
      }
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        setError(err?.response?.data?.error || 'Failed to fetch status');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, pollIntervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tripId, fetchStatus, pollIntervalMs]);

  return { trip, driverLocation, locationHistory, loading, error, refresh: fetchStatus };
}

/**
 * Hook for driver to broadcast their location.
 * Sends GPS position to server at regular intervals.
 */
export function useDriverLocationBroadcast(isOnline: boolean, intervalMs = 5000) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState('');
  const watchRef = useRef<number>();

  useEffect(() => {
    if (!isOnline || !navigator.geolocation) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation(pos); broadcast(pos); },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    // Watch position
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => { setLocation(pos); broadcast(pos); },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [isOnline]);

  const broadcast = async (pos: GeolocationPosition) => {
    try {
      await api.post('/dispatch/location', {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch { /* silent fail for location broadcast */ }
  };

  return { location, error };
}

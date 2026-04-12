'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Status-based marker colors for jobs
const getJobIcon = (status: string) => {
    let color = '#6366f1'; // indigo (accepted/in_progress)
    if (status === 'pending') color = '#f59e0b'; // amber
    if (status === 'completed') color = '#10b981'; // emerald
    if (status === 'cancelled') color = '#f43f5e'; // rose

    const svg = `<svg width="30" height="42" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0ZM15 20.25C12.1005 20.25 9.75 17.8995 9.75 15C9.75 12.1005 12.1005 9.75 15 9.75C17.8995 9.75 20.25 12.1005 20.25 15C20.25 17.8995 17.8995 20.25 15 20.25Z" fill="${color}"/>
    </svg>`;

    return L.divIcon({
        className: 'custom-div-icon',
        html: svg,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -45]
    });
};

// Driver marker icon
const getDriverIcon = (vCategory: string) => {
    const icon = vCategory === 'scooter' ? '🛵' : vCategory === 'truck' ? '🚚' : '🚗';
    const html = `<div style="background: white; border: 2px solid #0d9488; border-radius: 12px; padding: 6px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        ${icon}
    </div>`;

    return L.divIcon({
        className: 'custom-driver-icon',
        html: html,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
    });
};

interface DispatchMapProps {
    jobs: any[];
    drivers?: any[];
    onAssignJob?: (jobId: number, driverId: number) => void;
}

export default function DispatchMap({ jobs, drivers = [], onAssignJob }: DispatchMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const center: [number, number] = [17.2948, -62.7261];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const parseLoc = (loc: any) => {
        if (!loc) return null;
        if (typeof loc === 'object') return loc;
        try {
            return JSON.parse(loc);
        } catch (e) {
            return null;
        }
    };

    // Don't render on server or before hydration
    if (!isMounted) {
        return (
            <div className="w-full h-full min-h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-slate-400 text-sm font-medium">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
            key={`map-${Date.now()}`} // Force new instance on remount
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render Drivers */}
            {drivers.map(driver => (
                <Marker
                    key={`driver-${driver.user_id}`}
                    position={[driver.live_lat, driver.live_lng]}
                    icon={getDriverIcon(driver.vehicle_category)}
                >
                    <Popup>
                        <div className="text-center min-w-[150px]">
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Active Driver</p>
                            <h4 className="font-black text-slate-800 text-sm mb-1">{driver.name}</h4>
                            <p className="text-[10px] text-slate-500">{driver.make} {driver.model} ({driver.vehicle_category})</p>
                            <div className="mt-2 text-[9px] font-bold text-slate-400">
                                Last online: {new Date(driver.last_online).toLocaleTimeString()}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Render Jobs */}
            {jobs.map(job => {
                const pickup = parseLoc(job.pickup_location);
                const dropoff = parseLoc(job.dropoff_location);

                const pickupPos: [number, number] | null = (pickup?.lat && pickup?.lng) ? [pickup.lat, pickup.lng] : null;
                const dropoffPos: [number, number] | null = (dropoff?.lat && dropoff?.lng) ? [dropoff.lat, dropoff.lng] : null;

                // For live tracking of active jobs
                const currentPos: [number, number] | null = (job.live_lat && job.live_lng) ? [job.live_lat, job.live_lng] : pickupPos;

                const markerPos = currentPos || [center[0] + (Math.random() - 0.5) * 0.05, center[1] + (Math.random() - 0.5) * 0.05];

                return (
                    <div key={job.id}>
                        <Marker
                            position={markerPos as [number, number]}
                            icon={getJobIcon(job.transport_status)}
                        >
                            <Popup>
                                <div className="text-center min-w-[200px]">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${job.transport_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {job.service_type || 'Job'}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400">#{job.id}</span>
                                    </div>
                                    <h3 className="font-black text-slate-800 text-sm mb-1">{job.title}</h3>
                                    <div className="text-[10px] text-slate-500 mb-2 space-y-1 text-left px-2">
                                        <p><span className="font-bold text-teal-600 uppercase tracking-tighter">Requester:</span> {job.owner_name || job.userName || 'Anonymous'}</p>
                                        <p><span className="font-bold text-indigo-600 uppercase tracking-tighter">Driver:</span> {job.driver_name || 'Unassigned'}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 gap-4">
                                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-black uppercase">{job.transport_status}</span>
                                        {job.transport_status === 'pending' && onAssignJob ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAssignJob(job.id, -1); // Signal to open modal by passing -1
                                                }}
                                                className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700"
                                            >
                                                Assign
                                            </button>
                                        ) : (
                                            <span className="font-black text-teal-600 text-sm">${job.price}</span>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                        {pickupPos && dropoffPos && (
                            <Polyline
                                positions={[pickupPos, dropoffPos]}
                                color={job.transport_status === 'pending' ? '#fbbf24' : '#6366f1'}
                                weight={3}
                                dashArray="5, 10"
                                opacity={0.6}
                            />
                        )}
                    </div>
                );
            })}
        </MapContainer>
    );
}

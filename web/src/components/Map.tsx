'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: { position: [number, number]; label: string }[];
    mapId?: string; // Unique ID for this map instance
}

export default function Map({ center, zoom = 13, markers = [], mapId }: MapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);

    // Generate unique ID for this map instance
    const uniqueId = useRef(`map-${mapId || Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !containerRef.current) return;

        let map: any = null;
        let L: any = null;

        const initMap = async () => {
            try {
                // Dynamically import Leaflet
                L = await import('leaflet');

                // Fix default marker icons
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });

                // Check if container already has a map
                const container = containerRef.current;
                if (!container) return;

                // Clear any existing map instance on this container
                if ((container as any)._leaflet_id) {
                    (container as any)._leaflet_id = null;
                }

                // Create new map
                map = L.map(container, {
                    center: center,
                    zoom: zoom,
                    scrollWheelZoom: false,
                    zoomControl: true,
                });

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                // Add markers
                markers.forEach((marker) => {
                    L.marker(marker.position)
                        .addTo(map)
                        .bindPopup(marker.label);
                });

                mapInstanceRef.current = map;

                // Invalidate size after a short delay to ensure proper rendering
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                    }
                }, 100);

            } catch (error) {
                console.error('Failed to initialize map:', error);
            }
        };

        initMap();

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    // Silently handle cleanup errors
                }
                mapInstanceRef.current = null;
            }
        };
    }, [isClient]); // Only run once when client-side

    // Update map view when center/zoom changes
    useEffect(() => {
        if (mapInstanceRef.current && center) {
            try {
                mapInstanceRef.current.setView(center, zoom);
            } catch (e) {
                // Silently handle view update errors
            }
        }
    }, [center, zoom]);

    // Update markers when they change
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isClient) return;

        const updateMarkers = async () => {
            try {
                const L = await import('leaflet');

                // Clear existing markers (except tile layer)
                map.eachLayer((layer: any) => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // Add new markers
                markers.forEach((marker) => {
                    L.marker(marker.position)
                        .addTo(map)
                        .bindPopup(marker.label);
                });
            } catch (e) {
                // Silently handle marker update errors
            }
        };

        updateMarkers();
    }, [markers, isClient]);

    // Loading state
    if (!isClient) {
        return (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e2e8f0'
                }}
            >
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗺️</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Loading Map...</div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            id={uniqueId.current}
            style={{ height: '100%', width: '100%' }}
        />
    );
}

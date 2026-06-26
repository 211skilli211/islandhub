'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface VendorMapProps {
    location: string;
    businessName?: string;
    className?: string;
}

interface GeocodedLocation {
    lat: number;
    lng: number;
    displayName: string;
}

export default function VendorMap({ location, businessName, className = '' }: VendorMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [coords, setCoords] = useState<GeocodedLocation | null>(null);
    const [geocoding, setGeocoding] = useState(true);
    const [geoError, setGeoError] = useState<string | null>(null);

    // Geocode the location string using Nominatim
    useEffect(() => {
        if (!location || !isClient) return;

        const geocodeLocation = async () => {
            setGeocoding(true);
            setGeoError(null);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
                    {
                        headers: {
                            'User-Agent': 'IslandHub/1.0 (marketplace app)',
                        },
                    }
                );
                const data = await response.json();
                if (data && data.length > 0) {
                    setCoords({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        displayName: data[0].display_name,
                    });
                } else {
                    setGeoError('Location not found');
                }
            } catch {
                setGeoError('Could not geocode location');
            } finally {
                setGeocoding(false);
            }
        };

        geocodeLocation();
    }, [location, isClient]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initialize Leaflet map once we have coordinates
    useEffect(() => {
        if (!isClient || !containerRef.current || !coords) return;

        let map: any = null;
        let L: any = null;

        const initMap = async () => {
            try {
                L = await import('leaflet');

                // Fix default marker icons
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });

                const container = containerRef.current;
                if (!container) return;

                // Clean up existing map
                if (mapInstanceRef.current) {
                    try {
                        mapInstanceRef.current.remove();
                    } catch (e) {
                        // silent cleanup
                    }
                }

                map = L.map(container, {
                    center: [coords.lat, coords.lng],
                    zoom: 13,
                    scrollWheelZoom: true,
                    zoomControl: true,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                // Custom teal marker icon
                const markerHtml = `<div style="width:32px;height:32px;background:#0d9488;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>`;
                const customIcon = L.divIcon({
                    html: markerHtml,
                    className: 'vendor-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });

                L.marker([coords.lat, coords.lng], { icon: customIcon })
                    .addTo(map)
                    .bindPopup(`<div style="min-width:160px;padding:4px;">
                        <strong style="font-size:14px;color:#1e293b;">${businessName || 'Vendor Location'}</strong>
                        <br/>
                        <span style="font-size:12px;color:#64748b;">${location}</span>
                    </div>`)
                    .openPopup();

                mapInstanceRef.current = map;

                setTimeout(() => {
                    if (map) map.invalidateSize();
                }, 100);
            } catch (error) {
                console.error('Failed to initialize map:', error);
            }
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    // silent
                }
                mapInstanceRef.current = null;
            }
        };
    }, [isClient, coords, businessName, location]);

    // Loading / error states
    if (geocoding) {
        return (
            <div className={`bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden ${className}`}>
                <div className="h-[300px] bg-surface-secondary animate-pulse flex items-center justify-center">
                    <div className="text-center">
                        <MapPin size={32} className="mx-auto text-ink-tertiary/40 mb-2 animate-bounce" />
                        <p className="text-ink-tertiary font-medium text-sm">Finding location...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (geoError || !coords) {
        return (
            <div className={`bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden ${className}`}>
                <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center p-6">
                        <MapPin size={32} className="mx-auto text-ink-tertiary/40 mb-2" />
                        <h3 className="font-bold text-ink-primary mb-1">{businessName || 'Vendor Location'}</h3>
                        <p className="text-ink-tertiary text-sm">{location}</p>
                        {geoError && (
                            <p className="text-ink-tertiary/70 text-xs mt-2">Map unavailable for this location</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div
                    ref={containerRef}
                    style={{ height: '350px', width: '100%' }}
                />
                {/* Coordinates bar */}
                <div className="px-4 py-3 bg-surface-secondary border-t border-border-primary flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink-tertiary text-xs font-medium">
                        <MapPin size={14} className="text-accent-400" />
                        <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                    </div>
                    <a
                        href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-accent-400 hover:text-accent-500 transition-colors"
                    >
                        <Navigation size={12} />
                        Open in Maps
                    </a>
                </div>
            </div>
        </div>
    );
}

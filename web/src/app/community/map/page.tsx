'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Search, Layers } from 'lucide-react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Location {
    id: number;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    description?: string;
    address?: string;
}

type MapFilter = 'all' | 'events' | 'businesses' | 'services' | 'groups';

const FILTER_TYPES: { id: MapFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'events', label: 'Events' },
    { id: 'businesses', label: 'Businesses' },
    { id: 'services', label: 'Services' },
    { id: 'groups', label: 'Groups' },
];

function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
        events: '#f59e0b',
        businesses: '#0d9488',
        services: '#6366f1',
        groups: '#ec4899',
    };
    return colors[type.toLowerCase()] || '#64748b';
}

export default function MapPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<MapFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '50');
                if (activeFilter !== 'all') params.append('type', activeFilter);

                const response = await api.get(`/community/locations?${params.toString()}`);
                setLocations(response.data || response || []);
            } catch {
                try {
                    const fallback = await api.get(`/locations?limit=50`);
                    setLocations(fallback.data || fallback || []);
                } catch {
                    setLocations(getSampleLocations());
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchLocations();
    }, [activeFilter]);

    const getSampleLocations = (): Location[] => [
        { id: 1, name: 'Downtown Market Plaza', type: 'events', latitude: 18.2871, longitude: -65.6412, description: 'Hosting Island Food Festival 2026', address: '123 Market St' },
        { id: 2, name: 'Island Food Co.', type: 'businesses', latitude: 18.2900, longitude: -65.6400, description: 'Fresh local cuisine with Caribbean flair', address: '45 Harbor Ave' },
        { id: 3, name: 'South Beach', type: 'events', latitude: 18.2800, longitude: -65.6450, description: 'Weekly beach cleanup and yoga sessions', address: 'South Beach Rd' },
        { id: 4, name: 'Harbor Health Clinic', type: 'services', latitude: 18.2950, longitude: -65.6380, description: 'Family medicine and urgent care', address: '88 Bay Street' },
        { id: 5, name: 'Arts Collective HQ', type: 'groups', latitude: 18.2880, longitude: -65.6430, description: 'Local artists community hub', address: '7 Creative Lane' },
        { id: 6, name: 'West Beach Yoga', type: 'events', latitude: 18.2750, longitude: -65.6500, description: 'Sunset yoga sessions every week', address: 'West Beach' },
    ];

    const filteredLocations = locations.filter(loc => {
        const matchesType = activeFilter === 'all' || loc.type === activeFilter;
        const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (loc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    useEffect(() => {
        if (!isLoading && mapRef.current && filteredLocations.length > 0) {
            import('leaflet').then((L) => {
                const defaultIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
                const defaultRetina = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
                const shadowIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: defaultRetina,
                    iconUrl: defaultIcon,
                    shadowUrl: shadowIcon,
                });

                // Reset Leaflet container for Next.js strict mode
                const container = document.getElementById('map-container');
                if (container && (container as unknown as Record<string, unknown>)._leaflet_id) {
                    (container as unknown as { _leaflet_id: number })._leaflet_id = 0;
                }

                const bounds = filteredLocations.length === 1
                    ? [filteredLocations[0].latitude, filteredLocations[0].longitude] as [number, number]
                    : [
                        Math.min(...filteredLocations.map(l => l.latitude)),
                        Math.min(...filteredLocations.map(l => l.longitude)),
                        Math.max(...filteredLocations.map(l => l.latitude)),
                        Math.max(...filteredLocations.map(l => l.longitude)),
                    ] as [number, number, number, number];

                const center: [number, number] = filteredLocations.length === 1
                    ? [filteredLocations[0].latitude, filteredLocations[0].longitude]
                    : [
                        (Math.min(...filteredLocations.map(l => l.latitude)) + Math.max(...filteredLocations.map(l => l.latitude))) / 2,
                        (Math.min(...filteredLocations.map(l => l.longitude)) + Math.max(...filteredLocations.map(l => l.longitude))) / 2,
                    ];

                const map = L.map('map-container').setView(center, 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }).addTo(map);

                filteredLocations.forEach(loc => {
                    const color = getTypeColor(loc.type);
                    const markerHtml = `<div style="width:28px;height:28px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;
                    const customIcon = L.divIcon({
                        html: markerHtml,
                        className: 'custom-marker',
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                    });
                    L.marker([loc.latitude, loc.longitude], { icon: customIcon })
                        .addTo(map)
                        .bindPopup(`<div style="min-width:150px"><strong>${loc.name}</strong><br/><span style="color:#666;font-size:12px">${loc.type}</span><br/>${loc.description ? `<span style="font-size:12px">${loc.description}</span>` : ''}</div>`);
                });

                if (filteredLocations.length > 1) {
                    if (Array.isArray(bounds) && bounds.length === 4) {
                        map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]] as [[number, number], [number, number]], { padding: [40, 40] });
                    }
                }

                return () => {
                    map.remove();
                };
            }).catch(err => console.error('Leaflet load failed:', err));
        }
    }, [isLoading, filteredLocations]);

    return (
        <main className="min-h-screen bg-surface-primary">
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tighter">Explore Map</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Discover businesses, events, and listings near you</p>
                    </div>
                </div>

                <div className="relative flex-1 max-w-lg mb-8">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-surface-elevated rounded-2xl border border-border-primary font-medium outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    {FILTER_TYPES.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${activeFilter === f.id
                                ? 'bg-accent-500 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-surface-elevated text-ink-tertiary hover:bg-surface-secondary'
                                }`}
                        >
                            <Layers size={14} />
                            {f.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                        <div className="h-[500px] bg-surface-secondary animate-pulse flex items-center justify-center">
                            <div className="text-center">
                                <MapPin size={48} className="mx-auto text-ink-tertiary/40 mb-2 animate-bounce" />
                                <p className="text-ink-tertiary font-medium">Loading map...</p>
                            </div>
                        </div>
                    </div>
                ) : filteredLocations.length === 0 ? (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary">
                        <div className="h-[500px] flex items-center justify-center">
                            <div className="text-center p-8">
                                <EmojiIcon emoji="🗺️" size=48 className="text-6xl mb-4" />
                                <h3 className="text-xl font-black text-ink-primary mb-2">No locations found</h3>
                                <p className="text-ink-tertiary">
                                    {searchQuery || activeFilter !== 'all'
                                        ? 'Try adjusting your search or filters.'
                                        : 'Check back soon as locations are added.'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div ref={mapRef} id="map-container" className="h-[500px] rounded-2xl border border-border-primary overflow-hidden z-0" />
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredLocations.map(loc => (
                                <div key={loc.id} className="bg-surface-elevated rounded-xl p-4 border border-border-primary flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: getTypeColor(loc.type) }}></div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-ink-primary text-sm truncate">{loc.name}</p>
                                        <p className="text-xs text-ink-tertiary capitalize">{loc.type}</p>
                                        {loc.address && (
                                            <p className="text-xs text-ink-tertiary mt-0.5 flex items-center gap-1">
                                                <MapPin size={10} />
                                                {loc.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

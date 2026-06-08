'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MapPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface DriverMarker {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  vehicle?: string;
  icon?: 'car' | 'suv' | 'truck' | 'scooter' | 'boat';
}

export interface LiveTrackingMapProps {
  center?: MapPoint;
  zoom?: number;
  height?: string;
  pickup?: MapPoint | null;
  dropoff?: MapPoint | null;
  driver?: DriverMarker | null;
  routePolyline?: MapPoint[];
  liveTrail?: MapPoint[];
  showTraffic?: boolean;
  interactive?: boolean;
  onMapReady?: (map: L.Map) => void;
}

// ─── Icons (inline SVG to avoid asset path issues) ───────────────────────────

function createMarkerIcon(color: string, label?: string) {
  const size = label ? 42 : 30;
  const svg = `<svg width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
    </defs>
    <path d="M${size / 2} 0C${size * 0.15} 0 0 ${size * 0.15} 0 ${size / 2}C0 ${size * 0.85} ${size / 2} ${size + 12} ${size / 2} ${size + 12}C${size / 2} ${size + 12} ${size} ${size * 0.85} ${size} ${size / 2}C${size} ${size * 0.15} ${size * 0.85} 0 ${size / 2} 0Z" fill="${color}" filter="url(#shadow)"/>
    <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.22}" fill="white" opacity="0.9"/>
    ${label ? `<text x="${size / 2}" y="${size * 0.45}" text-anchor="middle" font-size="${size * 0.25}" font-weight="bold" fill="${color}">${label}</text>` : ''}
  </svg>`;
  return L.divIcon({ className: 'custom-marker', html: svg, iconSize: [size, size + 12], iconAnchor: [size / 2, size + 12], popupAnchor: [0, -(size + 12)] });
}

const ICONS = {
  pickup: () => createMarkerIcon('#22c55e', 'P'),
  dropoff: () => createMarkerIcon('#ef4444', 'D'),
  driver: (v?: string) => {
    const colors: Record<string, string> = { car: '#0d9488', suv: '#6366f1', truck: '#f59e0b', scooter: '#8b5cf6', boat: '#0ea5e9' };
    return createMarkerIcon(colors[v || 'car'] || colors.car, '🚕');
  },
  trail: () => createMarkerIcon('#0d9488'),
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function LiveTrackingMap({
  center = { lat: 17.2948, lng: -62.7261 },
  zoom = 13,
  height = '100vh',
  pickup,
  dropoff,
  driver,
  routePolyline = [],
  liveTrail = [],
  interactive = true,
  onMapReady,
}: LiveTrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{ route?: L.Polyline; trail?: L.Polyline; pickup?: L.Marker; dropoff?: L.Marker; driver?: L.Marker }>({});
  const [ready, setReady] = useState(false);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: false,
      interactive,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapRef.current = map;
    setReady(true);
    onMapReady?.(map);

    return () => { map.remove(); mapRef.current = null; setReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pickup marker
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (layersRef.current.pickup) { map.removeLayer(layersRef.current.pickup); }
    if (pickup) {
      const m = L.marker([pickup.lat, pickup.lng], { icon: ICONS.pickup() })
        .addTo(map)
        .bindPopup(`<div style="font-weight:700;font-size:13px;padding:4px 8px;">📍 Pickup</div><div style="font-size:12px;color:#666;">${pickup.address || ''}</div>`);
      layersRef.current.pickup = m;
    }
    return () => { if (!pickup && layersRef.current.pickup) { map.removeLayer(layersRef.current.pickup); layersRef.current.pickup = undefined; } };
  }, [ready, pickup?.lat, pickup?.lng, pickup?.address, pickup]);

  // Update dropoff marker
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (layersRef.current.dropoff) { map.removeLayer(layersRef.current.dropoff); }
    if (dropoff) {
      const m = L.marker([dropoff.lat, dropoff.lng], { icon: ICONS.dropoff() })
        .addTo(map)
        .bindPopup(`<div style="font-weight:700;font-size:13px;padding:4px 8px;">🎯 Dropoff</div><div style="font-size:12px;color:#666;">${dropoff.address || ''}</div>`);
      layersRef.current.dropoff = m;
    }
    return () => { if (!dropoff && layersRef.current.dropoff) { map.removeLayer(layersRef.current.dropoff); layersRef.current.dropoff = undefined; } };
  }, [ready, dropoff?.lat, dropoff?.lng, dropoff?.address, dropoff]);

  // Update driver marker (animated)
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (layersRef.current.driver) { map.removeLayer(layersRef.current.driver); }
    if (driver) {
      const m = L.marker([driver.lat, driver.lng], { icon: driver.icon ? ICONS.driver(driver.icon) : ICONS.driver(), zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<div style="font-weight:700;font-size:13px;padding:4px 8px;">🚕 ${driver.name}</div><div style="font-size:12px;color:#666;">${driver.vehicle || ''}</div>`);
      layersRef.current.driver = m;
      // Pan to driver
      map.panTo([driver.lat, driver.lng], { animate: true, duration: 1 });
    }
    return () => { if (!driver && layersRef.current.driver) { map.removeLayer(layersRef.current.driver); layersRef.current.driver = undefined; } };
  }, [ready, driver?.lat, driver?.lng, driver?.name, driver?.vehicle, driver?.icon, driver]);

  // Update route polyline
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (layersRef.current.route) { map.removeLayer(layersRef.current.route); }
    if (routePolyline.length >= 2) {
      const line = L.polyline(routePolyline.map(p => [p.lat, p.lng] as [number, number]), { color: '#facc15', weight: 5, opacity: 0.8, dashArray: '12 8', lineCap: 'round' }).addTo(map);
      layersRef.current.route = line;
      // Fit bounds to show entire route
      map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 15 });
    }
  }, [ready, JSON.stringify(routePolyline)]);

  // Update live trail
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (layersRef.current.trail) { map.removeLayer(layersRef.current.trail); }
    if (liveTrail.length >= 2) {
      const line = L.polyline(liveTrail.map(p => [p.lat, p.lng] as [number, number]), { color: '#0d9488', weight: 4, opacity: 0.7, lineCap: 'round', lineJoin: 'round' }).addTo(map);
      layersRef.current.trail = line;
    }
  }, [ready, JSON.stringify(liveTrail)]);

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
      {/* Legend overlay */}
      {(pickup || dropoff || driver) && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/10 space-y-1.5">
          {pickup && <div className="flex items-center gap-2 text-[10px] font-bold text-green-400"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Pickup</div>}
          {driver && <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" /> Driver</div>}
          {dropoff && <div className="flex items-center gap-2 text-[10px] font-bold text-red-400"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Dropoff</div>}
        </div>
      )}
    </div>
  );
}
